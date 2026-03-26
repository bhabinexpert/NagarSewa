// Admin routes for managing ward admins and dashboard stats
import express from 'express';
import { User } from '../models/User.js';
import { Issue } from '../models/Issue.js';
import { Campaign } from '../models/Campaign.js';
import { authMiddleware, adminOnly, superAdminOnly } from '../middleware/auth.js';
import { query } from '../db.js';
import bcrypt from 'bcrypt';

const router = express.Router();

// Create ward admin (super admin only)
router.post('/ward-admins', authMiddleware, superAdminOnly, async (req, res) => {
  try {
    const { full_name, email, phone, ward_number, password } = req.body;
    const normalizedName = String(full_name || '').trim();
    const normalizedEmail = String(email || '').trim().toLowerCase();
    const normalizedPhone = phone ? String(phone).trim() : null;
    const parsedWardNumber = Number(ward_number);

    // Validate input - password is now required
    if (!normalizedName || !normalizedEmail || !ward_number || !password) {
      return res.status(400).json({ message: "Name, email, ward number and password are required" });
    }

    if (!Number.isInteger(parsedWardNumber) || parsedWardNumber < 1 || parsedWardNumber > 10) {
      return res.status(400).json({ message: "Ward number must be a valid value between 1 and 10" });
    }

    // Validate password strength
    if (password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters long" });
    }

    // Check if email exists
    const existing = await User.findByEmail(normalizedEmail);
    if (existing) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Check if ward already has an active admin
    const wardAdmins = await User.getAllWardAdmins();
    const wardHasAdmin = wardAdmins.some(admin => 
      Number(admin.ward_number) === parsedWardNumber && !admin.is_disabled
    );
    
    if (wardHasAdmin) {
      return res.status(400).json({ message: "This ward already has an active admin" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create ward admin
    const admin = await User.createWardAdmin({
      full_name: normalizedName,
      email: normalizedEmail,
      password: hashedPassword,
      phone: normalizedPhone,
      ward_number: parsedWardNumber
    });

    res.status(201).json({ 
      message: "Ward admin created successfully", 
      admin: {
        id: admin.id,
        full_name: admin.full_name,
        email: admin.email,
        phone: admin.phone,
        ward_number: admin.ward_number,
        role: admin.role,
        createdAt: admin.created_at
      }
    });
  } catch (error) {
    console.error('Create ward admin error:', error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get all ward admins (super admin only)
router.get('/ward-admins', authMiddleware, superAdminOnly, async (req, res) => {
  try {
    const admins = await User.getAllWardAdmins();
    
    const formattedAdmins = admins.map(admin => ({
      id: admin.id,
      full_name: admin.full_name,
      email: admin.email,
      phone: admin.phone,
      ward_number: admin.ward_number,
      isActive: !admin.is_disabled,
      createdAt: admin.created_at
    }));

    res.json({ admins: formattedAdmins });
  } catch (error) {
    console.error('Get ward admins error:', error);
    res.status(500).json({ message: "Server error" });
  }
});

// Deactivate ward admin (super admin only)
router.patch('/ward-admins/:id/deactivate', authMiddleware, superAdminOnly, async (req, res) => {
  try {
    const admin = await User.toggleAdminStatus(req.params.id, false);
    if (!admin) {
      return res.status(404).json({ message: "Ward admin not found" });
    }

    res.json({ message: "Ward admin deactivated", admin });
  } catch (error) {
    console.error('Deactivate admin error:', error);
    res.status(500).json({ message: "Server error" });
  }
});

// Reactivate ward admin (super admin only)
router.patch('/ward-admins/:id/reactivate', authMiddleware, superAdminOnly, async (req, res) => {
  try {
    const admin = await User.toggleAdminStatus(req.params.id, true);
    if (!admin) {
      return res.status(404).json({ message: "Ward admin not found" });
    }

    res.json({ message: "Ward admin reactivated", admin });
  } catch (error) {
    console.error('Reactivate admin error:', error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get dashboard stats (filtered by role and ward)
router.get('/dashboard/stats', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { role, wardNumber } = req.user;
    
    // Issue stats
    let issueFilters = {};
    if (role === 'ward_admin') {
      issueFilters.ward = wardNumber;
    }
    
    const issues = await Issue.findAll(issueFilters);
    const issueStats = {
      total: issues.length,
      pending: issues.filter(i => (i.status || '').toLowerCase() === 'pending').length,
      inProgress: issues.filter(i => (i.status || '').toLowerCase() === 'in_progress').length,
      resolved: issues.filter(i => (i.status || '').toLowerCase() === 'resolved').length,
      rejected: issues.filter(i => (i.status || '').toLowerCase() === 'rejected').length
    };

    // User stats
    let userFilters = { role: 'user' };
    if (role === 'ward_admin') {
      userFilters.ward = wardNumber;
    }
    
    const users = await User.findAll(userFilters);
    const userStats = {
      total: users.length,
      verified: users.filter(u => (u.kyc_status || '').toUpperCase() === 'VERIFIED').length,
      pendingKyc: users.filter(u => (u.kyc_status || '').toUpperCase() === 'PENDING').length
    };

    // Campaign stats
    let campaignFilters = {};
    if (role === 'ward_admin') {
      campaignFilters.ward = wardNumber;
    }
    
    const campaigns = await Campaign.findAll(campaignFilters);
    const campaignStats = {
      total: campaigns.length,
      pending: campaigns.filter(c => (c.status || '').toUpperCase() === 'PENDING').length,
      approved: campaigns.filter(c => (c.status || '').toUpperCase() === 'APPROVED').length,
      rejected: campaigns.filter(c => (c.status || '').toUpperCase() === 'REJECTED').length,
      completed: campaigns.filter(c => (c.status || '').toUpperCase() === 'COMPLETED').length
    };

    res.json({
      issues: issueStats,
      users: userStats,
      campaigns: campaignStats
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get all users (filtered by ward for ward admin)
router.get('/users', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { role, wardNumber } = req.user;
    const { kycStatus, search, sort } = req.query;
    
    let filters = { role: 'user' };
    if (role === 'ward_admin') {
      filters.ward = wardNumber;
    }
    if (kycStatus && kycStatus !== 'all') {
      filters.kycStatus = kycStatus;
    }
    if (search) {
      filters.search = search;
    }

    const allUsers = await User.findAll(filters);
    
    // Format users for frontend
    const formattedUsers = allUsers.map(user => ({
      id: user.id,
      name: user.full_name,
      email: user.email,
      phone: user.phone,
      ward: user.ward_number,
      wardNumber: user.ward_number,
      role: user.role,
      kycStatus: user.kyc_status?.toLowerCase() || 'pending',
      enabled: !user.is_disabled,
      registeredOn: user.created_at,
      documents: user.kyc_documents || null
    }));

    // Calculate stats
    const stats = {
      total: formattedUsers.length,
      pendingKyc: formattedUsers.filter(u => u.kycStatus === 'pending').length,
      active: formattedUsers.filter(u => u.enabled && u.kycStatus === 'verified').length
    };

    res.json({ 
      success: true,
      data: {
        users: formattedUsers,
        stats: stats
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Update user KYC status (admin only)
router.patch('/users/:id/kyc', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { status } = req.body; // VERIFIED, REJECTED, PENDING
    
    if (!['VERIFIED', 'REJECTED', 'PENDING'].includes(status)) {
      return res.status(400).json({ message: "Invalid KYC status" });
    }

    // Update user (you'll need to add this method to User model)
    await query(
      'UPDATE users SET kyc_status = $1, updated_at = NOW() WHERE id = $2',
      [status, req.params.id]
    );

    res.json({ message: "KYC status updated" });
  } catch (error) {
    console.error('Update KYC error:', error);
    res.status(500).json({ message: "Server error" });
  }
});

// Disable user account (admin only)
router.patch('/users/:id/disable', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { reason } = req.body;
    
    await query(
      'UPDATE users SET is_disabled = true, disabled_reason = $1, updated_at = NOW() WHERE id = $2',
      [reason || 'Disabled by admin', req.params.id]
    );

    res.json({ message: "User account disabled" });
  } catch (error) {
    console.error('Disable user error:', error);
    res.status(500).json({ message: "Server error" });
  }
});

// Enable user account (admin only)
router.patch('/users/:id/enable', authMiddleware, adminOnly, async (req, res) => {
  try {
    await query(
      'UPDATE users SET is_disabled = false, disabled_reason = NULL, updated_at = NOW() WHERE id = $1',
      [req.params.id]
    );

    res.json({ success: true, message: "User account enabled" });
  } catch (error) {
    console.error('Enable user error:', error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ============================================================
// ANALYTICS ENDPOINTS
// ============================================================

// Get analytics overview
router.get('/analytics/overview', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { role, wardNumber } = req.user;
    let wardFilter = {};
    
    if (role === 'ward_admin') {
      wardFilter.ward = wardNumber;
    }
    
    const issues = await Issue.findAll(wardFilter);
    const users = await User.findAll({ ...wardFilter, role: 'user' });
    const campaigns = await Campaign.findAll(wardFilter);
    
    const overview = {
      totalIssues: issues.length,
      totalUsers: users.length,
      verifiedUsers: users.filter(u => (u.kyc_status || '').toUpperCase() === 'VERIFIED').length,
      resolvedIssues: issues.filter(i => (i.status || '').toLowerCase() === 'resolved').length,
      avgResolutionTime: 2.5, // This should be calculated from actual data
    };
    
    res.json({ data: overview });
  } catch (error) {
    console.error('Analytics overview error:', error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get issue statistics (by type, status, ward)
router.get('/analytics/issues', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { role, wardNumber } = req.user;
    let wardFilter = {};
    
    if (role === 'ward_admin') {
      wardFilter.ward = wardNumber;
    }
    
    const issues = await Issue.findAll(wardFilter);
    
    // Group by status
    const byStatus = [
      { status: 'pending', count: issues.filter(i => (i.status || '').toLowerCase() === 'pending').length, color: 'yellow' },
      { status: 'in progress', count: issues.filter(i => (i.status || '').toLowerCase() === 'in_progress').length, color: 'blue' },
      { status: 'resolved', count: issues.filter(i => (i.status || '').toLowerCase() === 'resolved').length, color: 'green' },
      { status: 'rejected', count: issues.filter(i => (i.status || '').toLowerCase() === 'rejected').length, color: 'red' },
    ];
    
    // Group by type
    const typeGroups = {};
    issues.forEach(issue => {
      const type = issue.category || issue.issue_type || 'Other';
      typeGroups[type] = (typeGroups[type] || 0) + 1;
    });
    
    const byType = Object.entries(typeGroups).map(([type, count]) => ({
      type,
      count
    }));
    
    // Group by ward (for super admin)
    const wardGroups = {};
    if (role === 'SUPER_ADMIN') {
      issues.forEach(issue => {
        const ward = issue.ward_number || 0;
        wardGroups[ward] = (wardGroups[ward] || 0) + 1;
      });
    }
    
    const byWard = Object.entries(wardGroups).map(([ward, count]) => ({
      ward: parseInt(ward),
      count
    }));
    
    res.json({ 
      data: { 
        byStatus, 
        byType,
        byWard: role === 'SUPER_ADMIN' ? byWard : []
      } 
    });
  } catch (error) {
    console.error('Issue analytics error:', error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get monthly trends
router.get('/analytics/trends', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { role, wardNumber } = req.user;
    
    // This is a simplified version
    // In production, you'd query the database for actual monthly data
    const monthlyTrends = [
      { month: 'Jan', issues: 12, resolved: 8 },
      { month: 'Feb', issues: 18, resolved: 14 },
      { month: 'Mar', issues: 24, resolved: 20 },
      { month: 'Apr', issues: 15, resolved: 12 },
      { month: 'May', issues: 21, resolved: 18 },
      { month: 'Jun', issues: 28, resolved: 24 },
    ];
    
    res.json({ data: monthlyTrends });
  } catch (error) {
    console.error('Trends analytics error:', error);
    res.status(500).json({ message: "Server error" });
  }
});

// Update admin profile
router.patch('/profile', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { full_name, phone } = req.body;
    const userId = req.user.id;

    // Validate input
    if (!full_name) {
      return res.status(400).json({ message: "Full name is required" });
    }

    // Update user profile in database
    const result = await query(
      `UPDATE users 
       SET full_name = $1, phone = $2, updated_at = NOW()
       WHERE id = $3
       RETURNING id, full_name, email, phone, role, ward_number, kyc_status, is_disabled`,
      [full_name, phone, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const updatedUser = result.rows[0];

    res.json({
      success: true,
      message: "Profile updated successfully",
      data: updatedUser
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: "Server error" });
  }
});

// Change admin password
router.patch('/password', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    // Validate input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Current password and new password are required" });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ message: "New password must be at least 8 characters long" });
    }

    // Get current user from database
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password in database
    await query(
      `UPDATE users 
       SET password = $1, updated_at = NOW()
       WHERE id = $2`,
      [hashedPassword, userId]
    );

    res.json({
      success: true,
      message: "Password changed successfully"
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
