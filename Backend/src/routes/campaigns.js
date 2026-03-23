// Campaign routes
import express from 'express';
import { createCampaign, getCampaigns, getCampaign, updateCampaignStatus } from '../controllers/campaign.js';
import { authMiddleware, adminOnly } from '../middleware/auth.js';
import { submissionLimiter } from '../middleware/submissionLimiter.js';

const router = express.Router();

router.post('/', authMiddleware, submissionLimiter('campaign'), createCampaign);
router.get('/', authMiddleware, getCampaigns);
router.get('/:id', authMiddleware, getCampaign);
router.patch('/:id/status', authMiddleware, adminOnly, updateCampaignStatus);

export default router;
