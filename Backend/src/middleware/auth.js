// Auth middleware - Protect routes
import jwt from 'jsonwebtoken';
import { query } from '../db.js';

// Verify JWT token
export const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const token = authHeader.split(' ')[1];

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Handle super admin (no database lookup needed)
    if (decoded.id === 'super-admin') {
      req.user = {
        id: 'super-admin',
        email: 'superadmin@damak.gov.np',
        role: 'super_admin',
        wardNumber: null
      };
      return next();
    }

    // Get user from database for regular users and ward admins
    const result = await query('SELECT id, email, role, ward_number FROM users WHERE id = $1 AND is_disabled = false', [decoded.id]);

    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'User not found or disabled' });
    }

    req.user = {
      id: result.rows[0].id,
      email: result.rows[0].email,
      role: result.rows[0].role,
      wardNumber: result.rows[0].ward_number
    };
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// Admin only
export const adminOnly = (req, res, next) => {
  const role = req.user.role.toLowerCase();
  if (role !== 'super_admin' && role !== 'ward_admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

// Super admin only
export const superAdminOnly = (req, res, next) => {
  const role = req.user.role.toLowerCase();
  if (role !== 'super_admin') {
    return res.status(403).json({ message: 'Super admin access required' });
  }
  next();
};
