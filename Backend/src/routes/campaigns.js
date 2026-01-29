/**
 * =============================================================================
 * CAMPAIGNS ROUTES - Community Campaign Requests
 * =============================================================================
 * 
 * This file handles all campaign-related API endpoints.
 * Users can request campaigns, and admins can approve/reject them.
 * Approved campaigns appear in the news feed for the target area.
 * 
 * ENDPOINTS:
 * - POST /campaigns - Create a new campaign request (User)
 * - GET /campaigns - Get all campaigns (filtered by role)
 * - GET /campaigns/:id - Get a single campaign by ID
 * - PATCH /campaigns/:id/status - Update campaign status (Admin)
 * - DELETE /campaigns/:id - Delete a campaign (Admin only)
 * 
 * CAMPAIGN STATUSES:
 * - PENDING: Newly submitted, awaiting admin review
 * - APPROVED: Accepted by admin, visible in feed
 * - REJECTED: Rejected by admin with reason
 * - COMPLETED: Campaign has ended
 */

import express from 'express';
import pool from '../db.js';
import { authMiddleware, adminOnly, superAdminOnly } from '../middleware/auth.js';

const router = express.Router();


// =============================================================================
// CREATE CAMPAIGN REQUEST (User)
// =============================================================================

/**
 * POST /campaigns
 * Create a new campaign request.
 * 
 * Required: User must be logged in and KYC verified.
 * 
 * Request Body:
 *   - title: Campaign title (required)
 *   - description: Detailed description (required)
 *   - category: Campaign type (required)
 *   - targetWard: Ward number where campaign will take place (required)
 *   - proposedDate: Proposed date for the campaign (optional)
 *   - proposedLocation: Specific location (optional)
 *   - estimatedParticipants: Expected number of participants (optional)
 *   - requirements: Any requirements/resources needed (optional)
 *   - contactPhone: Contact phone for coordination (optional)
 * 
 * Response: Created campaign object
 */
router.post('/', authMiddleware, async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      targetWard,
      proposedDate,
      proposedLocation,
      estimatedParticipants,
      requirements,
      contactPhone
    } = req.body;
    
    // Validate required fields
    if (!title || !description || !category || !targetWard) {
      return res.status(400).json({
        success: false,
        message: 'Title, description, category, and target ward are required'
      });
    }
    
    // Check if user has verified KYC
    const userResult = await pool.query(
      'SELECT kyc_status, ward_number FROM users WHERE id = $1',
      [req.user.id]
    );
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    if (userResult.rows[0].kyc_status !== 'VERIFIED') {
      return res.status(403).json({
        success: false,
        message: 'Please complete KYC verification before requesting campaigns'
      });
    }
    
    // Insert the campaign
    const result = await pool.query(
      `INSERT INTO campaigns (
        user_id, title, description, category, target_ward,
        proposed_date, proposed_location, estimated_participants,
        requirements, contact_phone, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'PENDING')
      RETURNING *`,
      [
        req.user.id,
        title,
        description,
        category,
        targetWard,
        proposedDate || null,
        proposedLocation || null,
        estimatedParticipants || null,
        requirements || null,
        contactPhone || null
      ]
    );
    
    res.status(201).json({
      success: true,
      message: 'Campaign request submitted successfully!',
      data: result.rows[0]
    });
    
  } catch (error) {
    console.error('Create campaign error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit campaign request. Please try again.'
    });
  }
});


// =============================================================================
// GET ALL CAMPAIGNS
// =============================================================================

/**
 * GET /campaigns
 * Get campaigns based on user role.
 * 
 * - Super Admin: Can see all campaigns
 * - Ward Admin: Can see campaigns for their ward
 * - Regular User: Can see their own campaigns + approved campaigns in their ward
 * 
 * Query Parameters:
 *   - status: Filter by status (pending, approved, rejected, completed)
 *   - ward: Filter by ward number
 *   - category: Filter by category
 *   - search: Search in title/description
 *   - sort: 'newest' or 'oldest' (default: newest)
 *   - page: Page number for pagination
 *   - limit: Items per page (default: 10)
 * 
 * Response: Array of campaigns with pagination info
 */
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { status, ward, category, search, sort = 'newest', page = 1, limit = 10 } = req.query;
    
    let baseQuery = `
      SELECT c.*, u.full_name as requester_name, u.email as requester_email,
             u.phone as requester_phone, u.ward_number as requester_ward,
             reviewer.full_name as reviewed_by_name
      FROM campaigns c
      LEFT JOIN users u ON c.user_id = u.id
      LEFT JOIN users reviewer ON c.reviewed_by = reviewer.id
    `;
    
    let conditions = [];
    let params = [];
    let paramIndex = 1;
    
    // Role-based filtering
    if (req.user.role === 'SUPER_ADMIN') {
      // Super admin sees all campaigns
    } else if (req.user.role === 'WARD_ADMIN') {
      // Ward admin sees campaigns for their ward
      conditions.push(`c.target_ward = $${paramIndex}`);
      params.push(req.user.wardNumber);
      paramIndex++;
    } else {
      // Regular users see their own campaigns + approved campaigns in their ward
      conditions.push(`(c.user_id = $${paramIndex} OR (c.status = 'APPROVED' AND c.target_ward = $${paramIndex + 1}))`);
      params.push(req.user.id, req.user.wardNumber);
      paramIndex += 2;
    }
    
    // Status filter
    if (status) {
      conditions.push(`c.status = $${paramIndex}`);
      params.push(status.toUpperCase());
      paramIndex++;
    }
    
    // Ward filter (for admins)
    if (ward && (req.user.role === 'SUPER_ADMIN')) {
      conditions.push(`c.target_ward = $${paramIndex}`);
      params.push(parseInt(ward));
      paramIndex++;
    }
    
    // Category filter
    if (category) {
      conditions.push(`c.category = $${paramIndex}`);
      params.push(category);
      paramIndex++;
    }
    
    // Search filter
    if (search) {
      conditions.push(`(c.title ILIKE $${paramIndex} OR c.description ILIKE $${paramIndex})`);
      params.push(`%${search}%`);
      paramIndex++;
    }
    
    // Build WHERE clause
    if (conditions.length > 0) {
      baseQuery += ' WHERE ' + conditions.join(' AND ');
    }
    
    // Count total for pagination
    const countQuery = baseQuery.replace(/SELECT c\.\*.*FROM/, 'SELECT COUNT(*) as total FROM');
    const countResult = await pool.query(countQuery, params);
    const total = parseInt(countResult.rows[0].total);
    
    // Add sorting
    const sortOrder = sort === 'oldest' ? 'ASC' : 'DESC';
    baseQuery += ` ORDER BY c.created_at ${sortOrder}`;
    
    // Add pagination
    const offset = (parseInt(page) - 1) * parseInt(limit);
    baseQuery += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(parseInt(limit), offset);
    
    const result = await pool.query(baseQuery, params);
    
    res.json({
      success: true,
      data: {
        campaigns: result.rows,
        total: total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
    
  } catch (error) {
    console.error('Get campaigns error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch campaigns'
    });
  }
});


// =============================================================================
// GET SINGLE CAMPAIGN BY ID
// =============================================================================

/**
 * GET /campaigns/:id
 * Get detailed information about a specific campaign.
 * 
 * Response: Campaign object with full details
 */
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      `SELECT c.*, u.full_name as requester_name, u.email as requester_email,
              u.phone as requester_phone, u.ward_number as requester_ward,
              reviewer.full_name as reviewed_by_name
       FROM campaigns c
       LEFT JOIN users u ON c.user_id = u.id
       LEFT JOIN users reviewer ON c.reviewed_by = reviewer.id
       WHERE c.id = $1`,
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found'
      });
    }
    
    const campaign = result.rows[0];
    
    // Check access permission
    if (req.user.role !== 'SUPER_ADMIN' && 
        req.user.role !== 'WARD_ADMIN' && 
        campaign.user_id !== req.user.id &&
        campaign.status !== 'APPROVED') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    res.json({
      success: true,
      data: campaign
    });
    
  } catch (error) {
    console.error('Get campaign error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch campaign'
    });
  }
});


// =============================================================================
// UPDATE CAMPAIGN STATUS (Admin Only)
// =============================================================================

/**
 * PATCH /campaigns/:id/status
 * Update the status of a campaign (approve/reject/complete).
 * 
 * Request Body:
 *   - status: New status ('APPROVED', 'REJECTED', 'COMPLETED')
 *   - adminResponse: Response message to the requester (optional but recommended)
 *   - rejectionReason: Reason for rejection (required if rejecting)
 * 
 * Response: Updated campaign object
 */
router.patch('/:id/status', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminResponse, rejectionReason } = req.body;
    
    // Validate status
    const validStatuses = ['APPROVED', 'REJECTED', 'COMPLETED', 'PENDING'];
    if (!status || !validStatuses.includes(status.toUpperCase())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be APPROVED, REJECTED, COMPLETED, or PENDING'
      });
    }
    
    // Require rejection reason if rejecting
    if (status.toUpperCase() === 'REJECTED' && !rejectionReason) {
      return res.status(400).json({
        success: false,
        message: 'Rejection reason is required when rejecting a campaign'
      });
    }
    
    // Get the campaign first to check ward permission
    const campaignCheck = await pool.query(
      'SELECT target_ward FROM campaigns WHERE id = $1',
      [id]
    );
    
    if (campaignCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found'
      });
    }
    
    // Ward admin can only manage their ward's campaigns
    if (req.user.role === 'WARD_ADMIN' && 
        campaignCheck.rows[0].target_ward !== req.user.wardNumber) {
      return res.status(403).json({
        success: false,
        message: 'You can only manage campaigns in your ward'
      });
    }
    
    // Update the campaign
    const result = await pool.query(
      `UPDATE campaigns
       SET status = $1,
           admin_response = $2,
           rejection_reason = $3,
           reviewed_by = $4,
           reviewed_at = NOW(),
           updated_at = NOW()
       WHERE id = $5
       RETURNING *`,
      [
        status.toUpperCase(),
        adminResponse || null,
        rejectionReason || null,
        req.user.id,
        id
      ]
    );
    
    res.json({
      success: true,
      message: `Campaign ${status.toLowerCase()} successfully!`,
      data: result.rows[0]
    });
    
  } catch (error) {
    console.error('Update campaign status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update campaign status'
    });
  }
});


// =============================================================================
// DELETE CAMPAIGN (Admin Only)
// =============================================================================

/**
 * DELETE /campaigns/:id
 * Delete a campaign (Super Admin only, or Ward Admin for their ward).
 * 
 * Response: Confirmation message
 */
router.delete('/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get the campaign first to check permission
    const campaignCheck = await pool.query(
      'SELECT target_ward, user_id FROM campaigns WHERE id = $1',
      [id]
    );
    
    if (campaignCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found'
      });
    }
    
    // Ward admin can only delete their ward's campaigns
    if (req.user.role === 'WARD_ADMIN' && 
        campaignCheck.rows[0].target_ward !== req.user.wardNumber) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete campaigns in your ward'
      });
    }
    
    await pool.query('DELETE FROM campaigns WHERE id = $1', [id]);
    
    res.json({
      success: true,
      message: 'Campaign deleted successfully'
    });
    
  } catch (error) {
    console.error('Delete campaign error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete campaign'
    });
  }
});


// =============================================================================
// GET CAMPAIGN STATISTICS (Admin Only)
// =============================================================================

/**
 * GET /campaigns/stats/overview
 * Get campaign statistics for the dashboard.
 * 
 * Response: Statistics object with counts by status
 */
router.get('/stats/overview', authMiddleware, adminOnly, async (req, res) => {
  try {
    let wardCondition = '';
    let params = [];
    
    // Ward admin can only see their ward's stats
    if (req.user.role === 'WARD_ADMIN') {
      wardCondition = 'WHERE target_ward = $1';
      params = [req.user.wardNumber];
    }
    
    const result = await pool.query(
      `SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'PENDING') as pending,
        COUNT(*) FILTER (WHERE status = 'APPROVED') as approved,
        COUNT(*) FILTER (WHERE status = 'REJECTED') as rejected,
        COUNT(*) FILTER (WHERE status = 'COMPLETED') as completed
       FROM campaigns ${wardCondition}`,
      params
    );
    
    res.json({
      success: true,
      data: result.rows[0]
    });
    
  } catch (error) {
    console.error('Get campaign stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch campaign statistics'
    });
  }
});


export default router;
