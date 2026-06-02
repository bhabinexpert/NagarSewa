// Issue routes
import express from 'express';
import { createIssue, getIssues, getIssue, updateIssueStatus, updateIssuePriority } from '../controllers/issue.js';
import { authMiddleware, adminOnly, superAdminOnly } from '../middleware/auth.js';
import { submissionLimiter } from '../middleware/submissionLimiter.js';

const router = express.Router();

// Photos are sent as base64 in the JSON body (stored in the DB), so no multer.
router.post('/', authMiddleware, submissionLimiter('issue'), createIssue);
router.get('/', authMiddleware, getIssues);
router.get('/:id', authMiddleware, getIssue);
router.patch('/:id/status', authMiddleware, adminOnly, updateIssueStatus);
router.patch('/:id/priority', authMiddleware, superAdminOnly, updateIssuePriority);

export default router;
