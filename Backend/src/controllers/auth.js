// Auth Controller - Handle authentication
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { asyncHandler, sendSuccess, sendError, HTTP_STATUS } from '../utils/response.js';
import { validateRequiredFields, isValidEmail, validatePassword } from '../utils/validation.js';

// Register new user
export const register = asyncHandler(async (req, res) => {
  const { full_name, email, password, phone, ward_number, gender, date_of_birth, address, profile_photo } = req.body;

  // Validate required fields
  const requiredFields = validateRequiredFields({ full_name, email, password });
  if (!requiredFields.isValid) {
    return sendError(res, requiredFields.message, HTTP_STATUS.BAD_REQUEST);
  }

  // Validate email format
  if (!isValidEmail(email)) {
    return sendError(res, 'Invalid email format', HTTP_STATUS.BAD_REQUEST);
  }

  // Validate password strength
  const passwordValidation = validatePassword(password);
  if (!passwordValidation.isValid) {
    return sendError(res, passwordValidation.message, HTTP_STATUS.BAD_REQUEST);
  }

  // Check if user exists
  const existingUser = await User.findByEmail(email);
  if (existingUser) {
    return sendError(res, 'Email already registered', HTTP_STATUS.BAD_REQUEST);
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create user
  const user = await User.create({
    full_name,
    email,
    password: hashedPassword,
    phone,
    ward_number,
    gender,
    date_of_birth,
    address,
    profile_photo
  });

  // Generate token
  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );

  sendSuccess(res, { token, user }, 'Registration successful', HTTP_STATUS.CREATED);
});

// Login user
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Validate required fields
  const requiredFields = validateRequiredFields({ email, password });
  if (!requiredFields.isValid) {
    return sendError(res, requiredFields.message, HTTP_STATUS.BAD_REQUEST);
  }

  // Verify credentials from database (all users including super admin)
  const user = await User.verifyPassword(email, password);
  if (!user) {
    return sendError(res, 'Invalid credentials', HTTP_STATUS.UNAUTHORIZED);
  }

  // Check if disabled
  if (user.is_disabled) {
    return sendError(res, 'Account disabled', HTTP_STATUS.FORBIDDEN, { isDisabled: true });
  }

  // Generate token with role and ward info
  const token = jwt.sign(
    { 
      id: user.id, 
      email: user.email, 
      role: user.role,
      wardNumber: user.ward_number
    },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );

  // Prepare user response
  const userResponse = {
    id: user.id,
    email: user.email,
    fullName: user.full_name,
    phone: user.phone,
    role: user.role,
    wardNumber: user.ward_number,
    gender: user.gender,
    dateOfBirth: user.date_of_birth,
    address: user.address,
    profilePhoto: user.profile_photo,
    kycVerified: user.kyc_status === 'VERIFIED',
    kycStatus: user.kyc_status,
    jurisdiction: {
      district: 'Jhapa',
      municipality: 'Damak',
      wardNumber: user.ward_number
    }
  };

  // Determine redirect based on role
  const normalizedRole = String(user.role || '').toLowerCase();
  const redirectTo = (normalizedRole === 'ward_admin' || normalizedRole === 'super_admin') ? '/admin' : '/user';

  sendSuccess(res, { token, user: userResponse, redirectTo }, 'Login successful');
});

// Get current user
export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) {
    return sendError(res, 'User not found', HTTP_STATUS.NOT_FOUND);
  }

  // Format user response to match frontend expectations (camelCase)
  const userResponse = {
    id: user.id,
    email: user.email,
    fullName: user.full_name,
    phone: user.phone,
    role: user.role,
    wardNumber: user.ward_number,
    gender: user.gender,
    dateOfBirth: user.date_of_birth,
    address: user.address,
    profilePhoto: user.profile_photo,
    kycVerified: user.kyc_status === 'VERIFIED',
    kycStatus: user.kyc_status,
    isDisabled: user.is_disabled,
    createdAt: user.created_at,
    updatedAt: user.updated_at,
    jurisdiction: {
      district: 'Jhapa',
      municipality: 'Damak',
      wardNumber: user.ward_number
    }
  };

  sendSuccess(res, { user: userResponse });
});

// Logout (client-side)
export const logout = (req, res) => {
  sendSuccess(res, null, 'Logged out successfully');
};
