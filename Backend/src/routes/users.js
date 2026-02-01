// User routes
import express from 'express';
import { authMiddleware, adminOnly } from '../middleware/auth.js';
import { 
  getAllUsers, 
  getUserById, 
  updateProfile, 
  submitKYC,
  getMyProfile 
} from '../controllers/user.js';

const router = express.Router();

// Get current user's profile (must be authenticated)
router.get('/me', authMiddleware, getMyProfile);

// Get all users (admin only)
router.get('/', authMiddleware, adminOnly, getAllUsers);

// Get user by ID (admin only)
router.get('/:id', authMiddleware, adminOnly, getUserById);

// Update user profile
router.patch('/:id/profile', authMiddleware, updateProfile);

// Submit KYC documents
router.post('/:id/kyc', authMiddleware, submitKYC);

export default router;
