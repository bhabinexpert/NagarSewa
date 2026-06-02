// Feed Controller - Handle community feed
import { query } from '../db.js';
import { asyncHandler, sendSuccess, sendError, HTTP_STATUS } from '../utils/response.js';

/**
 * Normalize issue photo field to an array of URLs.
 * Handles JSON strings, arrays, plain strings, and Buffer-like objects.
 */
function parseIssuePhotos(photoField) {
  if (!photoField) return [];

  // If it's an array, ensure all items are valid URLs
  if (Array.isArray(photoField)) {
    return photoField
      .map(url => {
        if (typeof url === 'string') {
          return url.trim();
        }
        return null;
      })
      .filter(url => url && url.length > 0);
  }

  // If it's a string, try multiple parsing strategies
  if (typeof photoField === 'string') {
    const trimmed = photoField.trim();
    if (!trimmed) return [];

    // Try JSON parsing first
    try {
      const parsed = JSON.parse(trimmed);
      // If parsed is an array, recursively parse it
      if (Array.isArray(parsed)) {
        return parseIssuePhotos(parsed);
      }
      // If parsed is a string, process it
      if (typeof parsed === 'string') {
        return parseIssuePhotos(parsed);
      }
      return [];
    } catch (e) {
      // Not valid JSON, continue to other strategies
    }

    // Check if it looks like a URL path
    if (trimmed.startsWith('/') || trimmed.includes('uploads')) {
      return [trimmed];
    }

    // Check if it's PostgreSQL array format: {"path1","path2"}
    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
      const inner = trimmed.slice(1, -1);
      if (!inner) return [];
      return inner
        .split(',')
        .map(item => item.trim().replace(/^"(.*)"$/, '$1'))
        .filter(item => item && item.length > 0);
    }

    // Check if it's comma-separated paths
    if (trimmed.includes(',')) {
      return trimmed
        .split(',')
        .map(item => item.trim())
        .filter(item => item && item.length > 0);
    }

    // Single value - return it if not empty
    return trimmed.length > 0 ? [trimmed] : [];
  }

  return [];
}

/**
 * Get community feed (issues, campaigns, programs, notices)
 * GET /api/feed
 */
export const getFeed = asyncHandler(async (req, res) => {
  const { type, ward, search, limit = 20 } = req.query;
  const role = (req.user?.role || '').toLowerCase();
  const isAdmin = role === 'super_admin' || role === 'ward_admin';
  const isSuperAdmin = role === 'super_admin';
  const userWard = req.user?.wardNumber || null;

  // Ward scoping for the feed: only a super admin sees every ward (and may
  // narrow to one via ?ward). Ward admins and citizens are locked to their own
  // ward, so issues/campaigns reported in their ward and notices targeted at
  // it are all they see — enforced on the server, not the client.
  const effectiveWard = isSuperAdmin ? (ward ? parseInt(ward) : null) : userWard;

  // Build query to fetch issues and campaigns
  let feedItems = [];

  // Fetch issues if type is 'issues' or 'all' or not specified
  if (!type || type === 'issues' || type === 'all') {
    let issuesSql = `
      SELECT 
        i.id,
        'issue' as type,
        i.category as title,
        i.description,
        i.status,
        i.priority,
        i.location,
        i.latitude,
        i.longitude,
        i.photo_url,
        i.category,
        i.created_at,
        i.updated_at,
        u.full_name,
        u.ward_number
      FROM issues i
      LEFT JOIN users u ON i.user_id = u.id
      WHERE 1=1
    `;
    const issueParams = [];
    let paramCount = 1;

    // Filter by the issue's ward (server-enforced; null = all wards for super admin)
    if (effectiveWard) {
      issuesSql += ` AND i.ward_number = $${paramCount}`;
      issueParams.push(effectiveWard);
      paramCount++;
    }

    // Search by description or category
    if (search) {
      issuesSql += ` AND (
        LOWER(i.category) LIKE $${paramCount} OR 
        LOWER(i.description) LIKE $${paramCount}
      )`;
      issueParams.push(`%${search.toLowerCase()}%`);
      paramCount++;
    }

    issuesSql += ' ORDER BY i.created_at DESC';
    issuesSql += ` LIMIT $${paramCount}`;
    issueParams.push(parseInt(limit));

    const issuesResult = await query(issuesSql, issueParams);
    feedItems = [...feedItems, ...issuesResult.rows];
  }

  // Fetch campaigns if type is 'campaigns' or 'all' or not specified
  if (!type || type === 'campaigns' || type === 'all') {
    let campaignsSql = `
      SELECT 
        c.id,
        'campaign' as type,
        c.title,
        c.description,
        c.status,
        c.category,
        c.target_ward,
        c.proposed_date,
        c.proposed_location,
        c.estimated_participants,
        c.created_at,
        c.updated_at,
        u.full_name,
        u.ward_number
      FROM campaigns c
      LEFT JOIN users u ON c.user_id = u.id
      WHERE 1=1
    `;
    const campaignParams = [];
    let paramCount = 1;

    // Filter by the campaign's target ward (server-enforced)
    if (effectiveWard) {
      campaignsSql += ` AND c.target_ward = $${paramCount}`;
      campaignParams.push(effectiveWard);
      paramCount++;
    }

    // Search by title or description
    if (search) {
      campaignsSql += ` AND (
        LOWER(c.title) LIKE $${paramCount} OR 
        LOWER(c.description) LIKE $${paramCount}
      )`;
      campaignParams.push(`%${search.toLowerCase()}%`);
      paramCount++;
    }

    campaignsSql += ' ORDER BY c.created_at DESC';
    campaignsSql += ` LIMIT $${paramCount}`;
    campaignParams.push(parseInt(limit));

    const campaignsResult = await query(campaignsSql, campaignParams);
    feedItems = [...feedItems, ...campaignsResult.rows];
  }

  // Fetch notices (broadcasts) for non-admin users
  if (!isAdmin && (!type || type === 'notices' || type === 'notice' || type === 'all')) {
    let broadcastsSql = `
      SELECT 
        b.id,
        'notice' as type,
        b.title,
        b.message as description,
        b.target_ward,
        b.created_at,
        COALESCE(u.full_name, CASE WHEN b.type = 'super_admin' THEN 'Super Admin' ELSE 'Ward Admin' END) as full_name
      FROM broadcasts b
      LEFT JOIN users u ON b.sent_by = u.id
      WHERE 1=1
    `;
    const broadcastParams = [];
    let paramCount = 1;

    // A citizen sees municipality-wide (super_admin) notices plus the
    // ward_admin notices targeted at their own ward.
    if (effectiveWard) {
      broadcastsSql += ` AND (b.type = 'super_admin' OR (b.type = 'ward_admin' AND b.target_ward = $${paramCount}))`;
      broadcastParams.push(effectiveWard);
      paramCount++;
    } else {
      broadcastsSql += ` AND b.type = 'super_admin'`;
    }

    if (search) {
      broadcastsSql += ` AND (
        LOWER(b.title) LIKE $${paramCount} OR 
        LOWER(b.message) LIKE $${paramCount}
      )`;
      broadcastParams.push(`%${search.toLowerCase()}%`);
      paramCount++;
    }

    broadcastsSql += ' ORDER BY b.created_at DESC';
    broadcastsSql += ` LIMIT $${paramCount}`;
    broadcastParams.push(parseInt(limit));

    const broadcastsResult = await query(broadcastsSql, broadcastParams);
    feedItems = [...feedItems, ...broadcastsResult.rows];
  }

  // Transform to camelCase format expected by frontend
  const formattedFeed = feedItems.map(item => {
    const issuePhotos = item.type === 'issue' ? parseIssuePhotos(item.photo_url) : [];

    return {
      id: item.id,
      type: item.type,
      author: item.full_name || 'Anonymous',
      title: item.title,
      titleNp: item.title, // Add Nepali version when available
      description: item.description,
      descriptionNp: item.description, // Add Nepali version when available
      location: item.location || null,
      wardNumber: item.ward_number || item.target_ward || null,
      timestamp: item.created_at,
      status: item.status?.toLowerCase() || null,
      hasImage: issuePhotos.length > 0,
      imageUrl: issuePhotos[0] || null,
      imageUrls: issuePhotos,
      category: item.category,
      priority: item.priority || null,
      adminResponse: null,
      adminResponseNp: null
    };
  });

  // Sort combined feed by timestamp descending
  formattedFeed.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  // Limit final feed if combined
  if ((!type || type === 'all') && formattedFeed.length > parseInt(limit)) {
    const limitedFeed = formattedFeed.slice(0, parseInt(limit));
    sendSuccess(res, limitedFeed);
  } else {
    sendSuccess(res, formattedFeed);
  }
});
