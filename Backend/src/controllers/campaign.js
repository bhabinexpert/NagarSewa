// Campaign Controller
import { Campaign } from '../models/Campaign.js';
import { asyncHandler, sendSuccess, sendError, HTTP_STATUS } from '../utils/response.js';
import { validateRequiredFields, isValidWardNumber } from '../utils/validation.js';

// Create campaign
export const createCampaign = asyncHandler(async (req, res) => {
  const { title, description, targetWard } = req.body;
  
  // Validate required fields
  const requiredFields = validateRequiredFields({ title, description, targetWard });
  if (!requiredFields.isValid) {
    return sendError(res, requiredFields.message, HTTP_STATUS.BAD_REQUEST);
  }

  // Validate ward number
  if (!isValidWardNumber(targetWard)) {
    return sendError(res, 'Invalid ward number (must be 1-9)', HTTP_STATUS.BAD_REQUEST);
  }

  const campaign = await Campaign.create({
    user_id: req.user.id,
    title: title,
    description: description,
    category: req.body.category,
    target_ward: targetWard,
    proposed_date: req.body.proposedDate || null,
    proposed_location: req.body.proposedLocation || null,
    estimated_participants: req.body.estimatedParticipants || null,
    requirements: req.body.requirements || null,
    contact_phone: req.body.contactPhone || null
  });
  
  sendSuccess(res, { campaign }, 'Campaign created successfully', HTTP_STATUS.CREATED);
});

// Get all campaigns
export const getCampaigns = asyncHandler(async (req, res) => {
  const filters = {
    status: req.query.status,
    ward: req.query.ward,
    user_id: req.query.user_id
  };
  
  const campaigns = await Campaign.findAll(filters);
  sendSuccess(res, { campaigns });
});

// Get campaign by ID
export const getCampaign = asyncHandler(async (req, res) => {
  const campaign = await Campaign.findById(req.params.id);
  
  if (!campaign) {
    return sendError(res, 'Campaign not found', HTTP_STATUS.NOT_FOUND);
  }
  
  sendSuccess(res, { campaign });
});

// Update campaign status (admin only)
export const updateCampaignStatus = asyncHandler(async (req, res) => {
  const { status, admin_response } = req.body;
  
  if (!status) {
    return sendError(res, 'Status is required', HTTP_STATUS.BAD_REQUEST);
  }

  const validStatuses = ['PENDING', 'APPROVED', 'REJECTED', 'COMPLETED'];
  if (!validStatuses.includes(status)) {
    return sendError(res, `Invalid status. Must be one of: ${validStatuses.join(', ')}`, HTTP_STATUS.BAD_REQUEST);
  }

  const campaign = await Campaign.updateStatus(
    req.params.id,
    status,
    req.user.id,
    admin_response
  );
  
  sendSuccess(res, { campaign }, 'Campaign status updated successfully');
});
