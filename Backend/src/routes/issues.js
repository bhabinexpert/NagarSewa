// Issue routes
import express from 'express';
import { createIssue, getIssues, getIssue, updateIssueStatus, updateIssuePriority } from '../controllers/issue.js';
import { authMiddleware, adminOnly, superAdminOnly } from '../middleware/auth.js';

const router = express.Router();

router.post('/', authMiddleware, createIssue);
router.get('/', authMiddleware, getIssues);
router.get('/:id', authMiddleware, getIssue);
router.patch('/:id/status', authMiddleware, adminOnly, updateIssueStatus);
router.patch('/:id/priority', authMiddleware, superAdminOnly, updateIssuePriority);

export default router;
