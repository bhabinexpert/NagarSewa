// Simple in-memory global request limiter.
// Protects backend from burst traffic by limiting requests per IP per window.
import { sendError, HTTP_STATUS } from '../utils/response.js';

const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_REQUESTS_PER_WINDOW = 300;
const AUTHENTICATED_MAX_REQUESTS_PER_WINDOW = 1200;

const requestStore = new Map();

function getClientIdentifier(req) {
  const forwardedFor = req.headers['x-forwarded-for'];
  const forwardedIp = typeof forwardedFor === 'string'
    ? forwardedFor.split(',')[0].trim()
    : null;
  const ip = forwardedIp || req.ip || req.socket?.remoteAddress || 'unknown';
  const authHeader = req.headers.authorization || '';

  // Separate authenticated users behind the same proxy IP.
  if (authHeader.startsWith('Bearer ')) {
    return `${ip}|${authHeader.slice(7)}`;
  }

  return ip;
}

function getRouteLimit(req) {
  // Admin and auth flows are legitimate high-frequency paths in the dashboard.
  if (req.path.startsWith('/api/admin') || req.path.startsWith('/api/auth')) {
    return AUTHENTICATED_MAX_REQUESTS_PER_WINDOW;
  }

  return MAX_REQUESTS_PER_WINDOW;
}

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
  const clientId = getClientIdentifier(req);
  const maxRequests = getRouteLimit(req);
  const now = Date.now();
  const current = requestStore.get(clientId);

  if (!current || current.windowStart + WINDOW_MS <= now) {
    requestStore.set(clientId, { count: 1, windowStart: now });
    return next();
  }

  current.count += 1;
  requestStore.set(clientId, current);

  if (current.count > maxRequests) {
    const retryAfterSeconds = Math.ceil((current.windowStart + WINDOW_MS - now) / 1000);
    res.set('Retry-After', String(Math.max(retryAfterSeconds, 1)));
    return sendError(
      res,
      'Too many requests. Please wait a few minutes before trying again.',
      HTTP_STATUS.TOO_MANY_REQUESTS || 429
    );
  }

  return next();
}

