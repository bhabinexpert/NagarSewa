// Broadcast model - Database operations for broadcasts
import { query } from '../db.js';

export const Broadcast = {
  // Create new broadcast
  async create(broadcastData) {
    const sql = `
      INSERT INTO broadcasts (
        title, message, type, target_ward, sent_by
      )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const values = [
      broadcastData.title,
      broadcastData.message,
      broadcastData.type,
      broadcastData.target_ward,
      broadcastData.sent_by
    ];
    const result = await query(sql, values);
    return result.rows[0];
  },

  // Get broadcasts for admin broadcast tab
  async findAdminBroadcasts({ role, wardNumber }) {
    let sql = `
      SELECT b.*, u.full_name
      FROM broadcasts b
      LEFT JOIN users u ON b.sent_by = u.id
      WHERE 1=1
    `;
    const values = [];
    let paramCount = 1;

    if (role === 'ward_admin') {
      sql += ` AND (b.type = 'super_admin' OR (b.type = 'ward_admin' AND b.target_ward = $${paramCount}))`;
      values.push(wardNumber);
      paramCount++;
    }

    sql += ' ORDER BY b.created_at DESC';

    const result = await query(sql, values);
    return result.rows;
  },

  // Get broadcasts for user feed
  async findForUserFeed({ wardNumber, search, limit = 20 }) {
    let sql = `
      SELECT 
        b.id,
        'notice' as feed_type,
        b.title,
        b.message,
        b.type,
        b.target_ward,
        b.sent_by,
        b.created_at,
        COALESCE(u.full_name, CASE WHEN b.type = 'super_admin' THEN 'Super Admin' ELSE 'Ward Admin' END) as full_name
      FROM broadcasts b
      LEFT JOIN users u ON b.sent_by = u.id
      WHERE b.type = 'super_admin'
         OR (b.type = 'ward_admin' AND b.target_ward = $1)
    `;
    const values = [wardNumber];
    let paramCount = 2;

    if (search) {
      sql += ` AND (LOWER(b.title) LIKE $${paramCount} OR LOWER(b.message) LIKE $${paramCount})`;
      values.push(`%${search.toLowerCase()}%`);
      paramCount++;
    }

    sql += ' ORDER BY b.created_at DESC';
    sql += ` LIMIT $${paramCount}`;
    values.push(parseInt(limit));

    const result = await query(sql, values);
    return result.rows;
  }
};
