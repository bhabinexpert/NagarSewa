// Feed routes
import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { getFeed } from '../controllers/feed.js';

const router = express.Router();

// Get community feed (requires authentication)
router.get('/', authMiddleware, getFeed);

export default router;
