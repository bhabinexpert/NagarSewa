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

    // Get user from database
    const result = await query('SELECT id, email, role, ward_number FROM users WHERE id = $1 AND is_disabled = false', [decoded.id]);

    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'User not found' });
    }

    req.user = result.rows[0];
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
  if (req.user.role !== 'SUPER_ADMIN' && req.user.role !== 'WARD_ADMIN') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

// Super admin only
export const superAdminOnly = (req, res, next) => {
  if (req.user.role !== 'SUPER_ADMIN') {
    return res.status(403).json({ message: 'Super admin access required' });
  }
  next();
};
