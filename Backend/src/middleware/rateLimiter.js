// Simple in-memory global request limiter.
// Protects backend from burst traffic by limiting requests per IP per window.
import { sendError, HTTP_STATUS } from '../utils/response.js';

const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_REQUESTS_PER_WINDOW = 300;

const requestStore = new Map();

// Cleanup old entries periodically to keep memory bounded.
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of requestStore.entries()) {
    if (entry.windowStart + WINDOW_MS <= now) {
      requestStore.delete(ip);
    }
  }
}, 60 * 1000);

export function globalRateLimiter(req, res, next) {
  const ip = req.ip || req.socket?.remoteAddress || 'unknown';
  const now = Date.now();
  const current = requestStore.get(ip);

  if (!current || current.windowStart + WINDOW_MS <= now) {
    requestStore.set(ip, { count: 1, windowStart: now });
    return next();
  }

  current.count += 1;
  requestStore.set(ip, current);

  if (current.count > MAX_REQUESTS_PER_WINDOW) {
    return sendError(
      res,
      'Too many requests. Please wait a few minutes before trying again.',
      HTTP_STATUS.TOO_MANY_REQUESTS || 429
    );
  }

  return next();
}

