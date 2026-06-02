// User model - Database operations for users
import { query } from '../db.js';
import bcrypt from 'bcrypt';

export const User = {
  // Create new user
  async create(userData) {
    const sql = `
      INSERT INTO users (full_name, email, password, phone, role, ward_number, gender, date_of_birth, address, profile_photo, is_disabled)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, false)
      RETURNING id, full_name, email, phone, role, ward_number, gender, date_of_birth, address, profile_photo, kyc_status, is_disabled, created_at
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
      userData.address || null,
      userData.profile_photo || null
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
    let sql = 'SELECT id, full_name, email, phone, role, ward_number, kyc_status, is_disabled, created_at, kyc_documents, profile_photo FROM users WHERE 1=1';
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
      const status = filters.kycStatus.toUpperCase();
      if (status === 'PENDING') {
        // The admin UI shows users who have not submitted documents yet as
        // "Pending KYC" too, so the pending filter must include both states.
        sql += ` AND kyc_status IN ('PENDING', 'NOT_SUBMITTED')`;
      } else {
        sql += ` AND kyc_status = $${paramCount}`;
        values.push(status);
        paramCount++;
      }
    }

    if (filters.search) {
      sql += ` AND (LOWER(full_name) LIKE $${paramCount} OR LOWER(email) LIKE $${paramCount} OR phone LIKE $${paramCount})`;
      values.push(`%${filters.search.toLowerCase()}%`);
      paramCount++;
    }

    // Sort by registration date; default to newest first.
    const direction = filters.sort === 'oldest' ? 'ASC' : 'DESC';
    sql += ` ORDER BY created_at ${direction}`;

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
    console.log('[User.toggleAdminStatus] AdminId type:', typeof adminId);
    console.log('[User.toggleAdminStatus] AdminId length:', String(adminId).length);
    
    // First, let's check if the user exists at all and what their role is
    const checkSql = 'SELECT id, full_name, email, role, is_disabled FROM users WHERE id = $1';
    const checkResult = await query(checkSql, [adminId]);
    console.log('[User.toggleAdminStatus] User exists check - Rows found:', checkResult.rows.length);
    if (checkResult.rows.length > 0) {
      const user = checkResult.rows[0];
      console.log('[User.toggleAdminStatus] Found user:', {
        id: user.id,
        name: user.full_name,
        email: user.email,
        role: user.role,
        role_type: typeof user.role,
        role_uppercase: String(user.role || '').toUpperCase(),
        is_disabled: user.is_disabled
      });
      console.log('[User.toggleAdminStatus] Role comparison:', {
        role_from_db: String(user.role || ''),
        role_uppercased: String(user.role || '').toUpperCase(),
        expected: 'WARD_ADMIN',
        match: String(user.role || '').toUpperCase() === 'WARD_ADMIN'
      });
    } else {
      console.log('[User.toggleAdminStatus] NO USER FOUND WITH ID:', adminId);
    }
    
    const sql = `
      UPDATE users 
      SET is_disabled = $1, updated_at = NOW()
      WHERE id = $2 AND UPPER(role) = 'WARD_ADMIN'
      RETURNING id, full_name, email, ward_number, is_disabled, role
    `;
    
    console.log('[User.toggleAdminStatus] Executing UPDATE query');
    console.log('[User.toggleAdminStatus] SQL:', sql);
    console.log('[User.toggleAdminStatus] Params:', [!isActive, adminId]);
    
    const result = await query(sql, [!isActive, adminId]);
    
    console.log('[User.toggleAdminStatus] UPDATE result rows length:', result.rows.length);
    if (result.rows.length === 0) {
      console.log('[User.toggleAdminStatus] ❌ UPDATE MATCHED ZERO ROWS');
      console.log('[User.toggleAdminStatus] This means either:');
      console.log('[User.toggleAdminStatus]   1) ID not found, OR');
      console.log('[User.toggleAdminStatus]   2) User exists but role is NOT WARD_ADMIN');
    } else {
      console.log('[User.toggleAdminStatus] ✓ UPDATE SUCCESSFUL');
      console.log('[User.toggleAdminStatus] Updated admin:', result.rows[0]);
    }
    
    return result.rows[0];
  }
};
