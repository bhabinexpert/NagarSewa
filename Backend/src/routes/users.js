// User routes
import express from 'express';
import { authMiddleware, adminOnly } from '../middleware/auth.js';
import { uploadKYCDocuments, handleUploadError } from '../middleware/upload.js';
import {
  getAllUsers,
  getUserById,
  updateProfile,
  submitKYC,
  getMyProfile,
  getUserKYC,
  updateUserKYCStatus,
  updateKYC
} from '../controllers/user.js';

const router = express.Router();

// Get current user's profile (must be authenticated)
router.get('/me', authMiddleware, getMyProfile);

// Get all users (admin only)
router.get('/', authMiddleware, adminOnly, getAllUsers);

// Get user by ID (admin only)
router.get('/:id', authMiddleware, adminOnly, getUserById);

// Get user KYC details for admin review
router.get('/:id/kyc', authMiddleware, adminOnly, getUserKYC);

// Update user profile
router.patch('/:id/profile', authMiddleware, updateProfile);

// Submit KYC documents (with file upload middleware)
router.post('/:id/kyc', authMiddleware, uploadKYCDocuments, handleUploadError, submitKYC);

// Update/Resubmit KYC documents (with file upload middleware)
router.patch('/:id/kyc', authMiddleware, uploadKYCDocuments, handleUploadError, updateKYC);

// Update user KYC status (admin only) - approve or reject
router.patch('/:id/kyc-status', authMiddleware, adminOnly, updateUserKYCStatus);

export default router;
