// Feed Controller - Handle community feed
import { query } from '../db.js';
import { asyncHandler, sendSuccess, sendError, HTTP_STATUS } from '../utils/response.js';

/**
 * Get community feed (issues and campaigns)
 * GET /api/feed
 */
export const getFeed = asyncHandler(async (req, res) => {
  const { type, ward, search, limit = 20 } = req.query;

  // Build query to fetch issues and campaigns
  let feedItems = [];

  // Fetch issues if type is 'issue' or 'all' or not specified
  if (!type || type === 'issue' || type === 'all') {
    let issuesSql = `
      SELECT 
        i.id,
        'issue' as type,
        i.title,
        i.description,
        i.status,
        i.priority,
        i.location,
        i.latitude,
        i.longitude,
        i.category,
        i.created_at,
        i.updated_at,
        u.full_name as user_name,
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

    // Search by title or description
    if (search) {
      issuesSql += ` AND (
        LOWER(i.title) LIKE $${paramCount} OR 
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

  // Fetch campaigns if type is 'campaign' or 'all' or not specified
  if (!type || type === 'campaign' || type === 'all') {
    let campaignsSql = `
      SELECT 
        c.id,
        'campaign' as type,
        c.title,
        c.description,
        c.status,
        c.category,
        c.target_amount,
        c.expected_start_date,
        c.expected_duration,
        c.created_at,
        c.updated_at,
        u.full_name as user_name,
        u.ward_number
      FROM campaigns c
      LEFT JOIN users u ON c.user_id = u.id
      WHERE c.status = 'APPROVED'
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

  // Sort combined feed by created_at descending
  feedItems.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  // Limit final feed if combined
  if ((!type || type === 'all') && feedItems.length > parseInt(limit)) {
    feedItems = feedItems.slice(0, parseInt(limit));
  }

  sendSuccess(res, feedItems);
});
