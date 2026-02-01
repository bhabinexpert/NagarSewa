/**
 * =============================================================================
 * RESPONSE UTILITIES
 * =============================================================================
 * Standardized response handlers for consistent API responses
 */

/**
 * Send successful response
 * @param {Object} res - Express response object
 * @param {*} data - Response data
 * @param {string} message - Success message
 * @param {number} statusCode - HTTP status code (default: 200)
 */
export const sendSuccess = (res, data = null, message = 'Success', statusCode = 200) => {
  const response = { success: true, message };
  if (data !== null) response.data = data;
  return res.status(statusCode).json(response);
};

/**
 * Send error response
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code (default: 500)
 * @param {*} error - Optional error details (only in development)
 */
export const sendError = (res, message = 'An error occurred', statusCode = 500, error = null) => {
  const response = { success: false, message };
  
  // Include error details only in development
  if (process.env.NODE_ENV === 'development' && error) {
    response.error = error.message || error;
  }
  
  return res.status(statusCode).json(response);
};

/**
 * Handle async controller errors
 * Wrapper to catch async errors and pass to error handler
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Common HTTP status codes
 */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
};
