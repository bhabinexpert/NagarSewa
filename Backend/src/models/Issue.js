// Issue model - Database operations for issues
import { query } from '../db.js';

// Helper function to normalize photo URLs
function parsePhotoUrls(photoField) {
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
        return parsePhotoUrls(parsed);
      }
      // If parsed is a string, process it
      if (typeof parsed === 'string') {
        return parsePhotoUrls(parsed);
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

export const Issue = {
  // Create new issue
  async create(issueData) {
    const sql = `
      INSERT INTO issues (
        user_id, category, description, ward_number,
        location, latitude, longitude, photo_url, priority
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;
    const values = [
      issueData.user_id,
      issueData.category,
      issueData.description,
      issueData.ward_number,
      issueData.location || null,
      issueData.latitude || null,
      issueData.longitude || null,
      issueData.photo_url || null,
      issueData.priority || 'MEDIUM'
    ];
    const result = await query(sql, values);
    return result.rows[0];
  },

  // Find issue by ID
  async findById(id) {
    const sql = `
      SELECT i.*, u.full_name as reporter_name
      FROM issues i
      LEFT JOIN users u ON i.user_id = u.id
      WHERE i.id = $1
    `;
    const result = await query(sql, [id]);
    if (result.rows.length === 0) return null;

    const issue = result.rows[0];
    // Parse photo_url to ensure it's an array of strings
    issue.photo_url = parsePhotoUrls(issue.photo_url);
    return issue;
  },

  // Get all issues
  async findAll(filters = {}) {
    let sql = `
      SELECT i.*, u.full_name as reporter_name
      FROM issues i
      LEFT JOIN users u ON i.user_id = u.id
      WHERE 1=1
    `;
    const values = [];
    let paramCount = 1;

    if (filters.status) {
      sql += ` AND i.status = $${paramCount}`;
      values.push(filters.status);
      paramCount++;
    }

    if (filters.ward) {
      sql += ` AND i.ward_number = $${paramCount}`;
      values.push(filters.ward);
      paramCount++;
    }

    if (filters.user_id) {
      sql += ` AND i.user_id = $${paramCount}`;
      values.push(filters.user_id);
      paramCount++;
    }

    if (filters.priority) {
      sql += ` AND i.priority = $${paramCount}`;
      values.push(filters.priority);
      paramCount++;
    }

    sql += ' ORDER BY i.created_at DESC';

    const result = await query(sql, values);
    // Parse photo_urls for all issues
    return result.rows.map(issue => ({
      ...issue,
      photo_url: parsePhotoUrls(issue.photo_url)
    }));
  },

  // Update issue status
  async updateStatus(id, status, resolutionNote = null) {
    const sql = `
      UPDATE issues
      SET status = $1, resolution_note = $2, updated_at = NOW()
      WHERE id = $3
      RETURNING *
    `;
    const result = await query(sql, [status, resolutionNote, id]);
    return result.rows[0];
  },

  // Update issue priority
  async updatePriority(id, priority, priorityNote = null) {
    const sql = `
      UPDATE issues
      SET priority = $1, priority_note = $2, updated_at = NOW()
      WHERE id = $3
      RETURNING *
    `;
    const result = await query(sql, [priority, priorityNote, id]);
    return result.rows[0];
  }
};
