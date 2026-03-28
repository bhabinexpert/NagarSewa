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
  const { full_name, phone, address, gender, date_of_birth } = req.body;

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

  if (gender !== undefined) {
    updates.push(`gender = $${paramCount}`);
    params.push(gender);
    paramCount++;
  }

  if (date_of_birth !== undefined) {
    updates.push(`date_of_birth = $${paramCount}`);
    params.push(date_of_birth);
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
    RETURNING id, full_name, email, phone, address, ward_number, role, gender, date_of_birth, kyc_status, is_disabled, created_at, updated_at
  `;

  const result = await query(sql, params);
  const updatedUser = result.rows[0];

  // Format response in camelCase - match the format from getMe
  const formattedUser = {
    id: updatedUser.id,
    fullName: updatedUser.full_name,
    email: updatedUser.email,
    phone: updatedUser.phone,
    address: updatedUser.address,
    wardNumber: updatedUser.ward_number,
    role: updatedUser.role,
    gender: updatedUser.gender,
    dateOfBirth: updatedUser.date_of_birth,
    kycStatus: updatedUser.kyc_status,
    kycVerified: updatedUser.kyc_status === 'VERIFIED',
    isDisabled: updatedUser.is_disabled,
    createdAt: updatedUser.created_at,
    updatedAt: updatedUser.updated_at,
    jurisdiction: {
      district: 'Jhapa',
      municipality: 'Damak',
      wardNumber: updatedUser.ward_number
    }
  };

  sendSuccess(res, formattedUser, 'Profile updated successfully');
});

/**
 * Submit KYC documents
 * POST /api/users/:id/kyc
 */
export const submitKYC = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Check if files were uploaded
  if (!req.files || !req.files.citizenshipFront || !req.files.citizenshipBack) {
    return sendError(res, 'Both citizenship documents (front and back) are required', HTTP_STATUS.BAD_REQUEST);
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

  // Build document paths object
  const kycDocuments = {
    citizenshipFront: `/uploads/kyc/${req.files.citizenshipFront[0].filename}`,
    citizenshipBack: `/uploads/kyc/${req.files.citizenshipBack[0].filename}`,
    uploadedAt: new Date().toISOString()
  };

  // Update KYC information with document paths
  const sql = `
    UPDATE users 
    SET 
      kyc_documents = $1,
      kyc_status = 'PENDING',
      updated_at = NOW()
    WHERE id = $2
    RETURNING id, full_name, email, kyc_status, kyc_documents, updated_at
  `;

  const result = await query(sql, [
    JSON.stringify(kycDocuments),
    id
  ]);

  const updatedUser = result.rows[0];

  // Format response
  const formattedResponse = {
    id: updatedUser.id,
    fullName: updatedUser.full_name,
    email: updatedUser.email,
    kycStatus: updatedUser.kyc_status,
    kycDocuments: updatedUser.kyc_documents,
    updatedAt: updatedUser.updated_at
  };

  sendSuccess(res, formattedResponse, 'KYC documents submitted successfully');
});

/**
 * Get user KYC details (admin only)
 * GET /api/admin/users/:id/kyc
 */
export const getUserKYC = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const user = await User.findById(id);

  if (!user) {
    return sendError(res, 'User not found', HTTP_STATUS.NOT_FOUND);
  }

  // Parse KYC documents if stored as JSON
  let kycDocuments = null;
  if (user.kyc_documents) {
    try {
      kycDocuments = typeof user.kyc_documents === 'string'
        ? JSON.parse(user.kyc_documents)
        : user.kyc_documents;
    } catch (e) {
      kycDocuments = user.kyc_documents;
    }
  }

  const kycInfo = {
    id: user.id,
    fullName: user.full_name,
    email: user.email,
    phone: user.phone,
    wardNumber: user.ward_number,
    kycStatus: user.kyc_status,
    kycDocuments: kycDocuments,
    registeredAt: user.created_at,
    updatedAt: user.updated_at
  };

  sendSuccess(res, { user: kycInfo });
});

/**
 * Update user KYC status (admin only)
 * PATCH /api/admin/users/:id/kyc-status
 */
export const updateUserKYCStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, rejectionReason } = req.body;

  if (!['VERIFIED', 'REJECTED', 'PENDING'].includes(status)) {
    return sendError(res, 'Invalid KYC status. Must be VERIFIED, REJECTED, or PENDING', HTTP_STATUS.BAD_REQUEST);
  }

  // Update status in database
  const updateFields = ['kyc_status = $1', 'updated_at = NOW()'];
  const params = [status];
  let paramCount = 2;

  if (status === 'REJECTED' && rejectionReason) {
    updateFields.push(`kyc_rejection_reason = $${paramCount}`);
    params.push(rejectionReason);
    paramCount++;
  }

  const sql = `
    UPDATE users
    SET ${updateFields.join(', ')}
    WHERE id = $${paramCount}
    RETURNING id, full_name, email, phone, ward_number, kyc_status, kyc_documents, created_at, updated_at
  `;

  params.push(id);

  const result = await query(sql, params);

  if (result.rows.length === 0) {
    return sendError(res, 'User not found', HTTP_STATUS.NOT_FOUND);
  }

  const updatedUser = result.rows[0];

  // Parse KYC documents
  let kycDocuments = null;
  if (updatedUser.kyc_documents) {
    try {
      kycDocuments = typeof updatedUser.kyc_documents === 'string'
        ? JSON.parse(updatedUser.kyc_documents)
        : updatedUser.kyc_documents;
    } catch (e) {
      kycDocuments = updatedUser.kyc_documents;
    }
  }

  const responseData = {
    id: updatedUser.id,
    fullName: updatedUser.full_name,
    email: updatedUser.email,
    phone: updatedUser.phone,
    wardNumber: updatedUser.ward_number,
    kycStatus: updatedUser.kyc_status,
    kycDocuments: kycDocuments,
    updatedAt: updatedUser.updated_at
  };

  sendSuccess(res, { user: responseData }, `KYC status updated to ${status}`);
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
