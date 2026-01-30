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

    // Validate input - password is now required
    if (!full_name || !email || !ward_number || !password) {
      return res.status(400).json({ message: "Name, email, ward number and password are required" });
    }

    // Validate password strength
    if (password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters long" });
    }

    // Check if email exists
    const existing = await User.findByEmail(email);
    if (existing) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Check if ward already has an active admin
    const wardAdmins = await User.getAllWardAdmins();
    const wardHasAdmin = wardAdmins.some(admin => 
      admin.ward_number === parseInt(ward_number) && !admin.is_disabled
    );
    
    if (wardHasAdmin) {
      return res.status(400).json({ message: "This ward already has an active admin" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create ward admin
    const admin = await User.createWardAdmin({
      full_name,
      email,
      password: hashedPassword,
      phone,
      ward_number: parseInt(ward_number)
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
      pending: issues.filter(i => i.status === 'pending').length,
      inProgress: issues.filter(i => i.status === 'in_progress').length,
      resolved: issues.filter(i => i.status === 'resolved').length
    };

    // User stats
    let userFilters = { role: 'user' };
    if (role === 'ward_admin') {
      userFilters.ward = wardNumber;
    }
    
    const users = await User.findAll(userFilters);
    const userStats = {
      total: users.length,
      verified: users.filter(u => u.kyc_status === 'VERIFIED').length,
      pendingKyc: users.filter(u => u.kyc_status === 'PENDING').length
    };

    // Campaign stats
    let campaignFilters = {};
    if (role === 'ward_admin') {
      campaignFilters.ward = wardNumber;
    }
    
    const campaigns = await Campaign.findAll(campaignFilters);
    const campaignStats = {
      total: campaigns.length,
      pending: campaigns.filter(c => c.status === 'pending').length,
      approved: campaigns.filter(c => c.status === 'approved').length
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
    
    let filters = { role: 'user' };
    if (role === 'ward_admin') {
      filters.ward = wardNumber;
    }

    const users = await User.findAll(filters);
    res.json({ users });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: "Server error" });
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
      'UPDATE users SET is_disabled = false, disabled_reason = NULL, updated_at = NOW() WHERE id = $2',
      [req.params.id]
    );

    res.json({ message: "User account enabled" });
  } catch (error) {
    console.error('Enable user error:', error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
