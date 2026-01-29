/**
 * =============================================================================
 * AUTH MIDDLEWARE - Authentication and Authorization
 * =============================================================================
 * 
 * This middleware verifies JWT tokens and checks user permissions.
 * Used to protect routes that require authentication.
 */

import jwt from 'jsonwebtoken';
import pool from '../db.js';

/**
 * Verify JWT token and attach user info to request.
 * Use this middleware on routes that require authentication.
 */
export const authMiddleware = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No token provided. Please login.'
      });
    }
    
    const token = authHeader.split(' ')[1];
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from database to ensure they still exist and aren't disabled
    const result = await pool.query(
      'SELECT id, email, role, ward_number, kyc_status, is_disabled FROM users WHERE id = $1',
      [decoded.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'User not found. Please login again.'
      });
    }
    
    const user = result.rows[0];
    
    // Check if user is disabled
    if (user.is_disabled) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been disabled. Please contact administrator.'
      });
    }
    
    // Attach user info to request
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      wardNumber: user.ward_number,
      kycStatus: user.kyc_status
    };
    
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token. Please login again.'
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired. Please login again.'
      });
    }
    console.error('Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authentication error'
    });
  }
};

/**
 * Check if user is an admin (Ward Admin or Super Admin).
 * Use after authMiddleware.
 */
export const adminOnly = (req, res, next) => {
  if (req.user.role !== 'SUPER_ADMIN' && req.user.role !== 'WARD_ADMIN') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin privileges required.'
    });
  }
  next();
};

/**
 * Check if user is a Super Admin.
 * Use after authMiddleware.
 */
export const superAdminOnly = (req, res, next) => {
  if (req.user.role !== 'SUPER_ADMIN') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Super Admin privileges required.'
    });
  }
  next();
};

/**
 * Check if user has verified KYC.
 * Use after authMiddleware.
 */
export const kycVerifiedOnly = (req, res, next) => {
  if (req.user.kycStatus !== 'VERIFIED') {
    return res.status(403).json({
      success: false,
      message: 'Please complete KYC verification first.'
    });
  }
  next();
};

export default {
  authMiddleware,
  adminOnly,
  superAdminOnly,
  kycVerifiedOnly
};
