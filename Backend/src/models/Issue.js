// Issue model - Database operations for issues
import { query } from '../db.js';

export const Issue = {
  // Create new issue
  async create(issueData) {
    const sql = `
      INSERT INTO issues (
        user_id, category, title, description, ward_number,
        location, latitude, longitude, photo_url, priority
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `;
    const values = [
      issueData.user_id,
      issueData.category,
      issueData.title || '',
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
    return result.rows[0];
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
    return result.rows;
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
