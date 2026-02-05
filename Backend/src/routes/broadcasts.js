// Broadcast routes
import express from 'express';
import { authMiddleware, adminOnly } from '../middleware/auth.js';
import { sendBroadcast, getAdminBroadcasts } from '../controllers/broadcast.js';

const router = express.Router();

// Send broadcast (admin only)
router.post('/', authMiddleware, adminOnly, sendBroadcast);

// Get super admin broadcasts for admin tab (admin only)
router.get('/', authMiddleware, adminOnly, getAdminBroadcasts);

export default router;
