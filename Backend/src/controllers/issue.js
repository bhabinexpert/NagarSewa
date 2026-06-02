// Issue Controller
import { Issue } from '../models/Issue.js';
import { asyncHandler, sendSuccess, sendError, HTTP_STATUS } from '../utils/response.js';
import { validateRequiredFields, isValidWardNumber } from '../utils/validation.js';

// Create issue
export const createIssue = asyncHandler(async (req, res) => {
  const { description, type, location, ward, photos } = req.body;

  // Validate required fields
  const requiredFields = validateRequiredFields({ description, type, location, ward });
  if (!requiredFields.isValid) {
    return sendError(res, requiredFields.message, HTTP_STATUS.BAD_REQUEST);
  }

  // Validate ward number
  if (!isValidWardNumber(ward)) {
    return sendError(res, 'Invalid ward number (must be 1-9)', HTTP_STATUS.BAD_REQUEST);
  }

  // Photos arrive as an array of base64 data URLs in the JSON body and are
  // stored directly in the DB (no disk files), so they persist on hosts with
  // an ephemeral filesystem — the same approach used for profile photos and KYC.
  let photoUrls = [];
  if (Array.isArray(photos)) {
    photoUrls = photos.filter((p) => typeof p === 'string' && p.length > 0);
  }

  const issue = await Issue.create({
    user_id: req.user.id,
    category: req.body.category || type,
    description: description,
    ward_number: req.body.ward_number || ward,
    location: location,
    latitude: req.body.latitude || null,
    longitude: req.body.longitude || null,
    photo_url: photoUrls.length > 0 ? JSON.stringify(photoUrls) : null,
    priority: req.body.priority || 'MEDIUM'
  });
  
  sendSuccess(res, { issue }, 'Issue created successfully', HTTP_STATUS.CREATED);
});

// Get all issues
export const getIssues = asyncHandler(async (req, res) => {
  const filters = {
    status: req.query.status,
    ward: req.query.ward,
    priority: req.query.priority,
    user_id: req.query.user_id
  };

  // A ward admin may only ever see issues from their own ward. Enforce this on
  // the server regardless of any `ward` the client sends, so it applies to the
  // dashboard's recent issues, the management tab, and any direct API call
  // alike. Super admins keep full visibility (and can filter via ?ward).
  const role = String(req.user.role || '').toLowerCase();
  if (role === 'ward_admin') {
    filters.ward = req.user.wardNumber;
  }

  const issues = await Issue.findAll(filters);
  sendSuccess(res, { issues });
});

// Get issue by ID
export const getIssue = asyncHandler(async (req, res) => {
  const issue = await Issue.findById(req.params.id);
  
  if (!issue) {
    return sendError(res, 'Issue not found', HTTP_STATUS.NOT_FOUND);
  }
  
  sendSuccess(res, { issue });
});

// Update issue status (admin only)
export const updateIssueStatus = asyncHandler(async (req, res) => {
  const { status, resolution_note } = req.body;
  
  if (!status) {
    return sendError(res, 'Status is required', HTTP_STATUS.BAD_REQUEST);
  }

  const validStatuses = ['PENDING', 'IN_PROGRESS', 'RESOLVED', 'REJECTED'];
  if (!validStatuses.includes(status)) {
    return sendError(res, `Invalid status. Must be one of: ${validStatuses.join(', ')}`, HTTP_STATUS.BAD_REQUEST);
  }

  const issue = await Issue.updateStatus(req.params.id, status, resolution_note);
  sendSuccess(res, { issue }, 'Issue status updated successfully');
});

// Update issue priority (super admin only)
export const updateIssuePriority = asyncHandler(async (req, res) => {
  const { priority, priority_note } = req.body;
  
  if (!priority) {
    return sendError(res, 'Priority is required', HTTP_STATUS.BAD_REQUEST);
  }

  const validPriorities = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
  if (!validPriorities.includes(priority)) {
    return sendError(res, `Invalid priority. Must be one of: ${validPriorities.join(', ')}`, HTTP_STATUS.BAD_REQUEST);
  }

  const issue = await Issue.updatePriority(req.params.id, priority, priority_note);
  sendSuccess(res, { issue }, 'Issue priority updated successfully');
});
