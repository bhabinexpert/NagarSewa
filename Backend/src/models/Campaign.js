// Campaign model - Database operations for campaigns
import { query } from '../db.js';

export const Campaign = {
  // Create new campaign
  async create(campaignData) {
    const sql = `
      INSERT INTO campaigns (
        user_id, title, description, category, target_ward,
        proposed_date, proposed_location, estimated_participants,
        requirements, contact_phone
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `;
    const values = [
      campaignData.user_id,
      campaignData.title,
      campaignData.description,
      campaignData.category,
      campaignData.target_ward,
      campaignData.proposed_date || null,
      campaignData.proposed_location || null,
      campaignData.estimated_participants || null,
      campaignData.requirements || null,
      campaignData.contact_phone || null
    ];
    const result = await query(sql, values);
    return result.rows[0];
  },

  // Find campaign by ID
  async findById(id) {
    const sql = `
      SELECT c.*, u.full_name as creator_name
      FROM campaigns c
      LEFT JOIN users u ON c.user_id = u.id
      WHERE c.id = $1
    `;
    const result = await query(sql, [id]);
    return result.rows[0];
  },

  // Get all campaigns
  async findAll(filters = {}) {
    let sql = `
      SELECT c.*, u.full_name as creator_name
      FROM campaigns c
      LEFT JOIN users u ON c.user_id = u.id
      WHERE 1=1
    `;
    const values = [];
    let paramCount = 1;

    if (filters.status) {
      sql += ` AND c.status = $${paramCount}`;
      values.push(filters.status);
      paramCount++;
    }

    if (filters.ward) {
      sql += ` AND c.target_ward = $${paramCount}`;
      values.push(filters.ward);
      paramCount++;
    }

    if (filters.user_id) {
      sql += ` AND c.user_id = $${paramCount}`;
      values.push(filters.user_id);
      paramCount++;
    }

    sql += ' ORDER BY c.created_at DESC';

    const result = await query(sql, values);
    return result.rows;
  },

  // Update campaign status
  async updateStatus(id, status, reviewerId, response = null) {
    const sql = `
      UPDATE campaigns
      SET status = $1, admin_response = $2, reviewed_by = $3, reviewed_at = NOW()
      WHERE id = $4
      RETURNING *
    `;
    const result = await query(sql, [status, response, reviewerId, id]);
    return result.rows[0];
  }
};
