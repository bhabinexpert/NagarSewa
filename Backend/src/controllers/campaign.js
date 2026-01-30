// Campaign Controller
import { Campaign } from '../models/Campaign.js';

// Create campaign
export const createCampaign = async (req, res) => {
  try {
    const campaign = await Campaign.create({
      ...req.body,
      user_id: req.user.id
    });
    res.status(201).json({ message: "Campaign created", campaign });
  } catch (error) {
    console.error('Create campaign error:', error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all campaigns
export const getCampaigns = async (req, res) => {
  try {
    const filters = {
      status: req.query.status,
      ward: req.query.ward,
      user_id: req.query.user_id
    };
    const campaigns = await Campaign.findAll(filters);
    res.json({ campaigns });
  } catch (error) {
    console.error('Get campaigns error:', error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get campaign by ID
export const getCampaign = async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) {
      return res.status(404).json({ message: "Campaign not found" });
    }
    res.json({ campaign });
  } catch (error) {
    console.error('Get campaign error:', error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update campaign status (admin only)
export const updateCampaignStatus = async (req, res) => {
  try {
    const { status, admin_response } = req.body;
    const campaign = await Campaign.updateStatus(
      req.params.id,
      status,
      req.user.id,
      admin_response
    );
    res.json({ message: "Campaign updated", campaign });
  } catch (error) {
    console.error('Update campaign error:', error);
    res.status(500).json({ message: "Server error" });
  }
};
