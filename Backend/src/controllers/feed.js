// Feed Controller - Handle community feed
import { query } from '../db.js';
import { asyncHandler, sendSuccess, sendError, HTTP_STATUS } from '../utils/response.js';

/**
 * Get community feed (issues, campaigns, programs, notices)
 * GET /api/feed
 */
export const getFeed = asyncHandler(async (req, res) => {
  const { type, ward, search, limit = 20 } = req.query;

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

    // Filter by ward
    if (ward) {
      issuesSql += ` AND u.ward_number = $${paramCount}`;
      issueParams.push(parseInt(ward));
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

    // Filter by ward
    if (ward) {
      campaignsSql += ` AND u.ward_number = $${paramCount}`;
      campaignParams.push(parseInt(ward));
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

  // Transform to camelCase format expected by frontend
  const formattedFeed = feedItems.map(item => ({
    id: item.id,
    type: item.type,
    author: item.full_name || 'Anonymous',
    title: item.title,
    titleNp: item.title, // Add Nepali version when available
    description: item.description,
    descriptionNp: item.description, // Add Nepali version when available
    location: item.location || null,
    wardNumber: item.ward_number,
    timestamp: item.created_at,
    status: item.status?.toLowerCase() || null,
    hasImage: false,
    category: item.category,
    priority: item.priority || null,
    adminResponse: null,
    adminResponseNp: null
  }));

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
