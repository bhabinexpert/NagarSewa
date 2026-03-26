// User model - Database operations for users
import { query } from '../db.js';
import bcrypt from 'bcrypt';

export const User = {
  // Create new user
  async create(userData) {
    const sql = `
      INSERT INTO users (full_name, email, password, phone, role, ward_number, gender, date_of_birth, address, is_disabled)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, false)
      RETURNING id, full_name, email, phone, role, ward_number, gender, date_of_birth, address, kyc_status, is_disabled, created_at
    `;
    const values = [
      userData.full_name,
      userData.email.toLowerCase(),
      userData.password,
      userData.phone || null,
      userData.role || 'user',
      userData.ward_number || null,
      userData.gender || null,
      userData.date_of_birth || null,
      userData.address || null
    ];
    const result = await query(sql, values);
    return result.rows[0];
  },

  // Find user by ID
  async findById(id) {
    const sql = 'SELECT * FROM users WHERE id = $1';
    const result = await query(sql, [id]);
    return result.rows[0];
  },

  // Find user by email
  async findByEmail(email) {
    const sql = 'SELECT * FROM users WHERE LOWER(email) = LOWER($1)';
    const result = await query(sql, [email]);
    return result.rows[0];
  },

  // Verify password
  async verifyPassword(email, password) {
    const user = await this.findByEmail(email);
    if (!user) return null;
    
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return null;
    
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  },

  // Update user
  async update(id, updateData) {
    const allowedFields = ['full_name', 'phone', 'ward_number', 'address'];
    const updates = [];
    const values = [];
    let paramCount = 1;

    Object.keys(updateData).forEach(key => {
      if (allowedFields.includes(key) && updateData[key] !== undefined) {
        updates.push(`${key} = $${paramCount}`);
        values.push(updateData[key]);
        paramCount++;
      }
    });

    if (updates.length === 0) throw new Error('No valid fields to update');

    values.push(id);
    const sql = `
      UPDATE users 
      SET ${updates.join(', ')}, updated_at = NOW()
      WHERE id = $${paramCount}
      RETURNING id, full_name, email, phone, role, ward_number
    `;

    const result = await query(sql, values);
    return result.rows[0];
  },

  // Get all users (with filters)
  async findAll(filters = {}) {
    let sql = 'SELECT id, full_name, email, phone, role, ward_number, kyc_status, is_disabled, created_at, kyc_documents FROM users WHERE 1=1';
    const values = [];
    let paramCount = 1;

    if (filters.role) {
      sql += ` AND role = $${paramCount}`;
      values.push(filters.role);
      paramCount++;
    }

    if (filters.ward) {
      sql += ` AND ward_number = $${paramCount}`;
      values.push(filters.ward);
      paramCount++;
    }

    if (filters.kycStatus) {
      sql += ` AND kyc_status = $${paramCount}`;
      values.push(filters.kycStatus.toUpperCase());
      paramCount++;
    }

    if (filters.search) {
      sql += ` AND (LOWER(full_name) LIKE $${paramCount} OR LOWER(email) LIKE $${paramCount} OR phone LIKE $${paramCount})`;
      values.push(`%${filters.search.toLowerCase()}%`);
      paramCount++;
    }

    sql += ' ORDER BY created_at DESC';

    const result = await query(sql, values);
    return result.rows;
  },

  // Create ward admin (super admin only)
  async createWardAdmin(adminData) {
    const sql = `
      INSERT INTO users (full_name, email, password, phone, role, ward_number, kyc_status)
      VALUES ($1, $2, $3, $4, 'ward_admin', $5, 'VERIFIED')
      RETURNING id, full_name, email, phone, role, ward_number, created_at
    `;
    const values = [
      adminData.full_name,
      adminData.email.toLowerCase(),
      adminData.password,
      adminData.phone || null,
      adminData.ward_number
    ];
    const result = await query(sql, values);
    return result.rows[0];
  },

  // Get all ward admins
  async getAllWardAdmins() {
    const sql = `
      SELECT id, full_name, email, phone, ward_number, is_disabled, created_at 
      FROM users 
      WHERE UPPER(role) = 'WARD_ADMIN'
      ORDER BY ward_number ASC
    `;
    const result = await query(sql);
    console.log('[User.getAllWardAdmins] Found', result.rows.length, 'ward admins');
    if (result.rows.length > 0) {
      console.log('[User.getAllWardAdmins] First admin:', result.rows[0]);
    }
    return result.rows;
  },

  // Toggle ward admin active status
  async toggleAdminStatus(adminId, isActive) {
    console.log('[User.toggleAdminStatus] Called with adminId:', adminId, 'isActive:', isActive);
    
    const sql = `
      UPDATE users 
      SET is_disabled = $1, updated_at = NOW()
      WHERE id = $2 AND UPPER(role) = 'WARD_ADMIN'
      RETURNING id, full_name, email, ward_number, is_disabled
    `;
    
    console.log('[User.toggleAdminStatus] SQL:', sql);
    console.log('[User.toggleAdminStatus] Params:', [!isActive, adminId]);
    
    const result = await query(sql, [!isActive, adminId]);
    
    console.log('[User.toggleAdminStatus] Result rows length:', result.rows.length);
    console.log('[User.toggleAdminStatus] Result:', result.rows[0]);
    
    return result.rows[0];
  }
};
