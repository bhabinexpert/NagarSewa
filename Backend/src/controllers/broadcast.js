// Broadcast Controller - Handle admin broadcasts
import { Broadcast } from '../models/Broadcast.js';
import { asyncHandler, sendSuccess, sendError, HTTP_STATUS } from '../utils/response.js';
import { validateRequiredFields } from '../utils/validation.js';

// Send broadcast (admin only)
export const sendBroadcast = asyncHandler(async (req, res) => {
  const { title, message } = req.body;

  const requiredFields = validateRequiredFields({ title, message });
  if (!requiredFields.isValid) {
    return sendError(res, requiredFields.message, HTTP_STATUS.BAD_REQUEST);
  }

  const role = (req.user.role || '').toLowerCase();
  const isSuperAdmin = role === 'super_admin';
  const isWardAdmin = role === 'ward_admin';

  if (!isSuperAdmin && !isWardAdmin) {
    return sendError(res, 'Admin access required', HTTP_STATUS.FORBIDDEN);
  }

  let targetWard = null;
  let type = 'super_admin';

  if (isWardAdmin) {
    if (!req.user.wardNumber) {
      return sendError(res, 'Ward admin must have a ward assigned', HTTP_STATUS.BAD_REQUEST);
    }
    targetWard = req.user.wardNumber;
    type = 'ward_admin';
  }

  const broadcast = await Broadcast.create({
    title: title.trim(),
    message: message.trim(),
    type,
    target_ward: targetWard,
    sent_by: req.user.id
  });

  sendSuccess(res, { broadcast }, 'Broadcast sent successfully', HTTP_STATUS.CREATED);
});

// Get broadcasts for admin broadcast tab (super admin notices only)
export const getAdminBroadcasts = asyncHandler(async (req, res) => {
  const role = (req.user.role || '').toLowerCase();
  const isAdmin = role === 'super_admin' || role === 'ward_admin';

  if (!isAdmin) {
    return sendError(res, 'Admin access required', HTTP_STATUS.FORBIDDEN);
  }

  const broadcasts = await Broadcast.findAdminBroadcasts({
    role,
    wardNumber: req.user.wardNumber || null
  });

  const formatted = broadcasts.map(item => ({
    id: item.id,
    title: item.title,
    message: item.message,
    type: item.type,
    targetWard: item.target_ward,
    level: item.type === 'super_admin' ? 'municipal' : 'ward',
    sentBy: item.sent_by,
    senderName: item.full_name || 'Super Admin',
    createdAt: item.created_at
  }));

  sendSuccess(res, { broadcasts: formatted });
});
