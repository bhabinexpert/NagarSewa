// User Controller - Handle user profile operations
import { User } from '../models/User.js';
import { query } from '../db.js';
import { asyncHandler, sendSuccess, sendError, HTTP_STATUS } from '../utils/response.js';
import { validateRequiredFields } from '../utils/validation.js';

/**
 * Get all users (admin only)
 * GET /api/users
 */
export const getAllUsers = asyncHandler(async (req, res) => {
  const { kycStatus, ward, search, sort = 'newest' } = req.query;
  
  let sql = `
    SELECT 
      id, full_name, email, phone, role, ward_number, 
      kyc_status, is_disabled, created_at, updated_at
    FROM users
    WHERE 1=1
  `;
  const params = [];
  let paramCount = 1;

  // Filter by KYC status
  if (kycStatus) {
    sql += ` AND kyc_status = $${paramCount}`;
    params.push(kycStatus.toUpperCase());
    paramCount++;
  }

  // Filter by ward (for ward admin)
  if (ward) {
    sql += ` AND ward_number = $${paramCount}`;
    params.push(parseInt(ward));
    paramCount++;
  }

  // Search by name, email, or phone
  if (search) {
    sql += ` AND (
      LOWER(full_name) LIKE $${paramCount} OR 
      LOWER(email) LIKE $${paramCount} OR 
      phone LIKE $${paramCount}
    )`;
    params.push(`%${search.toLowerCase()}%`);
    paramCount++;
  }

  // Sort
  sql += sort === 'oldest' ? ' ORDER BY created_at ASC' : ' ORDER BY created_at DESC';

  const result = await query(sql, params);

  sendSuccess(res, { 
    users: result.rows,
    total: result.rows.length 
  });
});

/**
 * Get user by ID
 * GET /api/users/:id
 */
export const getUserById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const user = await User.findById(id);
  
  if (!user) {
    return sendError(res, 'User not found', HTTP_STATUS.NOT_FOUND);
  }

  // Remove password from response
  const { password, ...userWithoutPassword } = user;

  sendSuccess(res, userWithoutPassword);
});

/**
 * Update user profile
 * PATCH /api/users/:id/profile
 */
export const updateProfile = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { full_name, phone, address, ward_number } = req.body;

  // Check if user exists
  const user = await User.findById(id);
  if (!user) {
    return sendError(res, 'User not found', HTTP_STATUS.NOT_FOUND);
  }

  // Only allow users to update their own profile (or admin)
  if (req.user.id !== id && req.user.role !== 'super_admin' && req.user.role !== 'ward_admin') {
    return sendError(res, 'Unauthorized', HTTP_STATUS.FORBIDDEN);
  }

  // Build update query
  const updates = [];
  const params = [];
  let paramCount = 1;

  if (full_name !== undefined) {
    updates.push(`full_name = $${paramCount}`);
    params.push(full_name);
    paramCount++;
  }

  if (phone !== undefined) {
    updates.push(`phone = $${paramCount}`);
    params.push(phone);
    paramCount++;
  }

  if (address !== undefined) {
    updates.push(`address = $${paramCount}`);
    params.push(address);
    paramCount++;
  }

  if (ward_number !== undefined) {
    updates.push(`ward_number = $${paramCount}`);
    params.push(ward_number);
    paramCount++;
  }

  if (updates.length === 0) {
    return sendError(res, 'No fields to update', HTTP_STATUS.BAD_REQUEST);
  }

  updates.push(`updated_at = NOW()`);
  params.push(id);

  const sql = `
    UPDATE users 
    SET ${updates.join(', ')}
    WHERE id = $${paramCount}
    RETURNING id, full_name, email, phone, address, ward_number, kyc_status, updated_at
  `;

  const result = await query(sql, params);

  sendSuccess(res, result.rows[0], 'Profile updated successfully');
});

/**
 * Submit KYC documents
 * POST /api/users/:id/kyc
 */
export const submitKYC = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { 
    citizenship_number, 
    citizenship_issued_district, 
    citizenship_issued_date 
  } = req.body;

  // Validate required fields
  const requiredFields = validateRequiredFields({
    citizenship_number,
    citizenship_issued_district,
    citizenship_issued_date
  });
  
  if (!requiredFields.isValid) {
    return sendError(res, requiredFields.message, HTTP_STATUS.BAD_REQUEST);
  }

  // Check if user exists
  const user = await User.findById(id);
  if (!user) {
    return sendError(res, 'User not found', HTTP_STATUS.NOT_FOUND);
  }

  // Only allow users to submit their own KYC
  if (req.user.id !== id) {
    return sendError(res, 'Unauthorized', HTTP_STATUS.FORBIDDEN);
  }

  // Update KYC information
  const sql = `
    UPDATE users 
    SET 
      citizenship_number = $1,
      citizenship_issued_district = $2,
      citizenship_issued_date = $3,
      kyc_status = 'PENDING',
      updated_at = NOW()
    WHERE id = $4
    RETURNING id, full_name, email, kyc_status, updated_at
  `;

  const result = await query(sql, [
    citizenship_number,
    citizenship_issued_district,
    citizenship_issued_date,
    id
  ]);

  sendSuccess(res, result.rows[0], 'KYC documents submitted successfully');
});

/**
 * Get current user's profile
 * GET /api/users/me
 */
export const getMyProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  
  if (!user) {
    return sendError(res, 'User not found', HTTP_STATUS.NOT_FOUND);
  }

  // Remove password from response
  const { password, ...userWithoutPassword } = user;

  sendSuccess(res, userWithoutPassword);
});
