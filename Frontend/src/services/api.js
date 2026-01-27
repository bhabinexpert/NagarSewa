/**
 * =============================================================================
 * API SERVICE - How the Frontend Talks to the Backend
 * =============================================================================
 * 
 * This file contains all the functions that send requests to our backend server.
 * Think of it as a "phone" that connects the user interface to the database.
 * 
 * HOW IT WORKS:
 * 1. User clicks a button (e.g., "Submit Issue")
 * 2. Frontend calls a function from this file (e.g., issuesAPI.create())
 * 3. This file sends the data to the backend server
 * 4. Backend processes it and sends back a response
 * 5. Frontend shows the result to the user
 * 
 * IMPORTANT CONCEPTS:
 * - API = Application Programming Interface (a way for programs to talk)
 * - Endpoint = A specific URL on the server (e.g., /api/issues)
 * - JWT Token = A "pass" that proves you're logged in
 * - HTTP Methods:
 *   - GET = Read data (like viewing issues)
 *   - POST = Create data (like submitting a new issue)
 *   - PATCH = Update data (like changing issue status)
 *   - DELETE = Remove data (like deleting a notification)
 */


// =============================================================================
// CONFIGURATION
// =============================================================================

/**
 * The base URL for all API requests.
 * In development: http://localhost:5000/api
 * In production: Set VITE_API_URL in your .env file
 */
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';


// =============================================================================
// HELPER FUNCTIONS (used internally by this file)
// =============================================================================

/**
 * Gets the user's login token from browser storage.
 * This token proves the user is logged in.
 * 
 * Returns: The token string, or null if not logged in
 */
function getAuthToken() {
  return localStorage.getItem('authToken');
}

/**
 * Creates the headers needed for API requests.
 * Headers tell the server what type of data we're sending
 * and who we are (via the auth token).
 * 
 * Returns: An object with Content-Type and Authorization headers
 */
function getHeaders() {
  // Start with the content type header
  const headers = {
    'Content-Type': 'application/json'
  };
  
  // If user is logged in, add their token
  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
}

/**
 * Processes the response from the server.
 * - If successful: returns the data
 * - If error: throws an error with the message
 * 
 * @param {Response} response - The response from fetch()
 * @returns {Promise} The parsed JSON data
 * @throws {Error} If the server returned an error
 */
async function handleResponse(response) {
  // Convert the response to JSON
  const data = await response.json();
  
  // Check if the request was successful (status 200-299)
  if (!response.ok) {
    // Throw an error with the server's message
    throw new Error(data.message || 'Something went wrong');
  }
  
  // Return the successful data
  return data;
}

/**
 * Sends a request to the API server.
 * This is the main function that all other API functions use.
 * 
 * @param {string} endpoint - The API path (e.g., '/issues')
 * @param {Object} options - Request options (method, body, etc.)
 * @returns {Promise} The response data from the server
 * 
 * EXAMPLE:
 *   const data = await apiRequest('/issues', { method: 'GET' });
 */
async function apiRequest(endpoint, options = {}) {
  // Build the full URL
  const url = `${API_BASE_URL}${endpoint}`;
  
  // Combine our default headers with any custom headers
  const headers = {
    ...getHeaders(),
    ...options.headers
  };
  
  // Send the request
  const response = await fetch(url, {
    ...options,
    headers: headers
  });
  
  // Process and return the response
  return handleResponse(response);
}

/**
 * Converts an object of parameters into a URL query string.
 * 
 * EXAMPLE:
 *   buildQueryString({ status: 'pending', ward: '5' })
 *   Returns: 'status=pending&ward=5'
 */
function buildQueryString(params) {
  return new URLSearchParams(params).toString();
}

// =============================================================================
// AUTHENTICATION API - Login, Register, Logout
// =============================================================================

/**
 * Functions for user authentication (login, register, etc.)
 * 
 * BACKEND ENDPOINTS:
 * - POST /auth/register → Create a new user account
 * - POST /auth/login → Log in and get a token
 * - POST /auth/logout → Log out the user
 * - GET /auth/me → Get the current user's info
 */
export const authAPI = {
  
  /**
   * Register a new user account.
   * 
   * @param {Object} userData - The user's registration info
   *   - fullName: User's full name
   *   - email: Email address
   *   - phone: Phone number
   *   - password: Password
   *   - province: Province code
   *   - district: District code
   *   - municipality: Municipality code
   *   - wardNumber: Ward number
   * 
   * @returns {Promise} The new user and their login token
   * 
   * EXAMPLE:
   *   const result = await authAPI.register({
   *     fullName: 'Ram Sharma',
   *     email: 'ram@example.com',
   *     password: 'mypassword',
   *     ...
   *   });
   */
  register: function(userData) {
    return apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  },

  /**
   * Log in an existing user.
   * 
   * @param {Object} credentials - Login info
   *   - email: User's email
   *   - password: User's password
   * 
   * @returns {Promise} The user info and login token
   * 
   * EXAMPLE:
   *   const result = await authAPI.login({
   *     email: 'ram@example.com',
   *     password: 'mypassword'
   *   });
   */
  login: function(credentials) {
    return apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
  },

  /**
   * Log out the current user.
   * 
   * @returns {Promise} Confirmation of logout
   */
  logout: function() {
    return apiRequest('/auth/logout', { method: 'POST' });
  },

  /**
   * Get the currently logged-in user's info.
   * 
   * @returns {Promise} The user's profile data
   */
  getCurrentUser: function() {
    return apiRequest('/auth/me');
  }
};

// =============================================================================
// ISSUES API - Report and Manage Issues/Complaints
// =============================================================================

/**
 * Functions for managing issues (complaints reported by citizens).
 * 
 * BACKEND ENDPOINTS:
 * - GET /issues → Get list of all issues
 * - GET /issues/:id → Get one specific issue
 * - POST /issues → Create a new issue report
 * - PATCH /issues/:id/status → Update issue status (admin)
 * - PATCH /issues/:id/priority → Set priority (super admin)
 */
export const issuesAPI = {
  
  /**
   * Get a list of issues with optional filters.
   * 
   * @param {Object} params - Filter options (all optional)
   *   - status: 'pending', 'inProgress', 'resolved', or 'rejected'
   *   - ward: Ward number to filter by
   *   - priority: 'low', 'medium', 'high', or 'urgent'
   *   - search: Text to search for
   *   - sort: 'newest' or 'oldest'
   *   - page: Page number (for pagination)
   *   - limit: How many items per page
   * 
   * @returns {Promise} List of issues with total count
   * 
   * EXAMPLE:
   *   // Get all pending issues from ward 5
   *   const result = await issuesAPI.getAll({ status: 'pending', ward: '5' });
   */
  getAll: function(params = {}) {
    const queryString = buildQueryString(params);
    return apiRequest(`/issues?${queryString}`);
  },

  /**
   * Get a single issue by its ID.
   * 
   * @param {string} id - The issue's unique ID
   * @returns {Promise} The issue details
   * 
   * EXAMPLE:
   *   const issue = await issuesAPI.getById('abc123');
   */
  getById: function(id) {
    return apiRequest(`/issues/${id}`);
  },

  /**
   * Create a new issue report.
   * Uses FormData because it may include photo/video uploads.
   * 
   * @param {FormData} issueData - The issue data with files
   *   - title: Issue title
   *   - description: Detailed description
   *   - category: Type of issue
   *   - ward: Ward number
   *   - media: Photos or videos (optional)
   * 
   * @returns {Promise} The created issue
   * 
   * EXAMPLE:
   *   const formData = new FormData();
   *   formData.append('title', 'Pothole on main road');
   *   formData.append('description', 'Large pothole near the school');
   *   formData.append('media', photoFile);
   *   const result = await issuesAPI.create(formData);
   */
  create: function(issueData) {
    // Note: We use fetch directly here because FormData needs
    // different headers than JSON (no Content-Type header)
    return fetch(`${API_BASE_URL}/issues`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`
      },
      body: issueData  // FormData object with files
    }).then(handleResponse);
  },

  /**
   * Update the status of an issue (for ward admins).
   * 
   * @param {string} id - The issue's ID
   * @param {Object} data - Status update info
   *   - status: New status ('pending', 'inProgress', 'resolved', 'rejected')
   *   - response: Admin's response message (optional)
   *   - assignedTeam: Team assigned to fix it (optional)
   * 
   * @returns {Promise} The updated issue
   * 
   * EXAMPLE:
   *   await issuesAPI.updateStatus('abc123', {
   *     status: 'inProgress',
   *     response: 'We have assigned a team to fix this.',
   *     assignedTeam: 'Road Maintenance'
   *   });
   */
  updateStatus: function(id, data) {
    return apiRequest(`/issues/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  },

  /**
   * Set the priority of an issue (for super admin).
   * 
   * @param {string} id - The issue's ID
   * @param {Object} data - Priority info
   *   - priority: 'low', 'medium', 'high', or 'urgent'
   *   - note: Message for the ward admin (optional)
   * 
   * @returns {Promise} The updated issue
   */
  setPriority: function(id, data) {
    return apiRequest(`/issues/${id}/priority`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  }
};

// =============================================================================
// USERS API - User Management (Admin Only)
// =============================================================================

/**
 * Functions for managing users (mostly for admins).
 * 
 * BACKEND ENDPOINTS:
 * - GET /users → Get list of all users (admin only)
 * - GET /users/:id → Get one user's details
 * - PATCH /users/:id → Update user profile
 * - PATCH /users/:id/kyc → Submit KYC documents
 * - PATCH /users/:id/kyc/verify → Approve KYC (admin)
 * - PATCH /users/:id/kyc/reject → Reject KYC (admin)
 * - PATCH /users/:id/disable → Disable user account (admin)
 * - PATCH /users/:id/enable → Enable user account (admin)
 */
export const usersAPI = {
  
  /**
   * Get a list of all users (admin only).
   * 
   * @param {Object} params - Filter options (all optional)
   *   - kycStatus: 'verified', 'pending', or 'rejected'
   *   - search: Search by name, email, or phone
   *   - sort: 'newest' or 'oldest'
   * 
   * @returns {Promise} List of users with total count
   */
  getAll: function(params = {}) {
    const queryString = buildQueryString(params);
    return apiRequest(`/users?${queryString}`);
  },

  /**
   * Get a single user by their ID.
   * 
   * @param {string} id - The user's unique ID
   * @returns {Promise} The user's details
   */
  getById: function(id) {
    return apiRequest(`/users/${id}`);
  },

  /**
   * Update a user's profile.
   * 
   * @param {string} id - The user's ID
   * @param {Object} data - The fields to update
   * @returns {Promise} The updated user
   */
  updateProfile: function(id, data) {
    return apiRequest(`/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  },

  /**
   * Submit KYC (identity verification) documents.
   * Uses FormData because it includes file uploads.
   * 
   * @param {string} id - The user's ID
   * @param {FormData} kycData - The KYC documents
   *   - citizenshipFront: Front of citizenship card
   *   - citizenshipBack: Back of citizenship card
   * 
   * @returns {Promise} The updated user with KYC status
   */
  submitKYC: function(id, kycData) {
    return fetch(`${API_BASE_URL}/users/${id}/kyc`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`
      },
      body: kycData  // FormData with document files
    }).then(handleResponse);
  },

  /**
   * Approve a user's KYC (admin only).
   * 
   * @param {string} id - The user's ID
   * @returns {Promise} The updated user
   */
  verifyKYC: function(id) {
    return apiRequest(`/users/${id}/kyc/verify`, { method: 'PATCH' });
  },

  /**
   * Reject a user's KYC (admin only).
   * 
   * @param {string} id - The user's ID
   * @param {Object} data - Rejection info
   *   - reason: Why the KYC was rejected
   * 
   * @returns {Promise} The updated user
   */
  rejectKYC: function(id, data) {
    return apiRequest(`/users/${id}/kyc/reject`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  },

  /**
   * Disable a user's account (admin only).
   * 
   * @param {string} id - The user's ID
   * @param {Object} data - Disable info
   *   - reason: Why the account is being disabled
   * 
   * @returns {Promise} Confirmation
   */
  disable: function(id, data) {
    return apiRequest(`/users/${id}/disable`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  },

  /**
   * Re-enable a disabled user account (admin only).
   * 
   * @param {string} id - The user's ID
   * @returns {Promise} Confirmation
   */
  enable: function(id) {
    return apiRequest(`/users/${id}/enable`, { method: 'PATCH' });
  }
};

// ============================================================================
// =============================================================================
// NOTIFICATIONS API - User Notifications and Admin Broadcasts
// =============================================================================

/**
 * Functions for managing notifications.
 * 
 * BACKEND ENDPOINTS:
 * - GET /notifications → Get user's notifications
 * - PATCH /notifications/:id/read → Mark one as read
 * - PATCH /notifications/read-all → Mark all as read
 * - DELETE /notifications/:id → Delete a notification
 * - POST /notifications/broadcast → Send broadcast (admin)
 * - GET /notifications/broadcasts → Get broadcast history (admin)
 */
export const notificationsAPI = {
  
  /**
   * Get notifications for the current user.
   * 
   * @param {Object} params - Filter options (all optional)
   *   - type: 'announcement' or 'update'
   *   - unread: true to get only unread notifications
   * 
   * @returns {Promise} List of notifications
   */
  getAll: function(params = {}) {
    const queryString = buildQueryString(params);
    return apiRequest(`/notifications?${queryString}`);
  },

  /**
   * Mark a single notification as read.
   * 
   * @param {string} id - The notification's ID
   * @returns {Promise} Confirmation
   */
  markAsRead: function(id) {
    return apiRequest(`/notifications/${id}/read`, { method: 'PATCH' });
  },

  /**
   * Mark all notifications as read.
   * 
   * @returns {Promise} Confirmation
   */
  markAllAsRead: function() {
    return apiRequest('/notifications/read-all', { method: 'PATCH' });
  },

  /**
   * Delete a notification.
   * 
   * @param {string} id - The notification's ID
   * @returns {Promise} Confirmation
   */
  delete: function(id) {
    return apiRequest(`/notifications/${id}`, { method: 'DELETE' });
  },

  /**
   * Broadcast a notification to users (admin only).
   * 
   * @param {Object} data - Broadcast details
   *   - title: Notification title
   *   - message: Notification message
   *   - type: 'announcement', 'alert', 'info', or 'urgent'
   *   - audience: 'all', 'ward', or 'verified'
   *   - wardNumber: Target ward (if audience is 'ward')
   *   - scheduledFor: When to send (ISO date string, optional)
   * 
   * @returns {Promise} The created broadcast
   * 
   * EXAMPLE:
   *   await notificationsAPI.broadcast({
   *     title: 'Water Supply Notice',
   *     message: 'Water supply will be disrupted tomorrow.',
   *     type: 'announcement',
   *     audience: 'all'
   *   });
   */
  broadcast: function(data) {
    return apiRequest('/notifications/broadcast', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  /**
   * Get history of all broadcasts (admin only).
   * 
   * @param {Object} params - Filter options
   * @returns {Promise} List of past broadcasts
   */
  getBroadcastHistory: function(params = {}) {
    const queryString = buildQueryString(params);
    return apiRequest(`/notifications/broadcasts?${queryString}`);
  },

  /**
   * Delete a broadcast (admin only).
   * 
   * @param {string} id - The broadcast's ID
   * @returns {Promise} Confirmation
   */
  deleteBroadcast: function(id) {
    return apiRequest(`/notifications/broadcasts/${id}`, { method: 'DELETE' });
  }
};

// =============================================================================
// NEWS FEED API - Community Feed
// =============================================================================

/**
 * Functions for the community news feed.
 * Shows issues, programs, and notices from the community.
 * 
 * BACKEND ENDPOINTS:
 * - GET /feed → Get community feed posts
 */
export const feedAPI = {
  
  /**
   * Get community feed posts.
   * 
   * @param {Object} params - Filter options (all optional)
   *   - type: 'issue', 'program', or 'notice'
   *   - ward: Ward number to filter by
   *   - search: Text to search for
   * 
   * @returns {Promise} List of feed posts
   */
  getAll: function(params = {}) {
    const queryString = buildQueryString(params);
    return apiRequest(`/feed?${queryString}`);
  }
};


// =============================================================================
// ANALYTICS API - Dashboard Statistics (Admin Only)
// =============================================================================

/**
 * Functions for getting analytics data (for admin dashboards).
 * 
 * BACKEND ENDPOINTS:
 * - GET /analytics/overview → General statistics
 * - GET /analytics/issues → Issue breakdown
 * - GET /analytics/trends → Monthly trend data
 */
export const analyticsAPI = {
  
  /**
   * Get overview statistics (total users, issues, etc.).
   * 
   * @param {Object} params - Filter options
   *   - ward: Filter by ward (super admin only)
   *   - period: 'week', 'month', or 'year'
   * 
   * @returns {Promise} Overview statistics
   */
  getOverview: function(params = {}) {
    const queryString = buildQueryString(params);
    return apiRequest(`/analytics/overview?${queryString}`);
  },

  /**
   * Get detailed issue statistics.
   * Returns breakdown by type, status, and ward.
   * 
   * @param {Object} params - Filter options
   * @returns {Promise} Issue statistics
   */
  getIssueStats: function(params = {}) {
    const queryString = buildQueryString(params);
    return apiRequest(`/analytics/issues?${queryString}`);
  },

  /**
   * Get monthly trend data (for charts).
   * 
   * @param {Object} params - Filter options
   * @returns {Promise} Monthly trend data
   */
  getTrends: function(params = {}) {
    const queryString = buildQueryString(params);
    return apiRequest(`/analytics/trends?${queryString}`);
  }
};


// =============================================================================
// BROADCASTS API - For municipal announcements and notifications
// =============================================================================

/**
 * Functions for managing broadcast notifications.
 * Used by admins to send announcements to citizens.
 * 
 * BACKEND ENDPOINTS:
 * - GET /broadcasts → List all broadcasts
 * - POST /broadcasts → Create new broadcast
 * - DELETE /broadcasts/:id → Delete a broadcast
 */
export const broadcastsAPI = {
  
  /**
   * Get all broadcasts.
   * 
   * @param {Object} params - Filter options
   *   - ward: Filter by ward number
   *   - status: 'active', 'expired', or 'all'
   * 
   * @returns {Promise} List of broadcasts
   */
  getAll: function(params = {}) {
    const queryString = buildQueryString(params);
    return apiRequest(`/broadcasts?${queryString}`);
  },

  /**
   * Create a new broadcast announcement.
   * 
   * @param {Object} data - Broadcast data
   *   - title: Broadcast title
   *   - message: Broadcast message content
   *   - targetWards: Array of ward numbers to target (or 'all')
   *   - priority: 'normal', 'important', or 'urgent'
   *   - expiresAt: Optional expiration date
   * 
   * @returns {Promise} Created broadcast object
   */
  create: function(data) {
    return apiRequest('/broadcasts', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  /**
   * Delete a broadcast by ID.
   * 
   * @param {string} broadcastId - ID of broadcast to delete
   * @returns {Promise} Deletion confirmation
   */
  delete: function(broadcastId) {
    return apiRequest(`/broadcasts/${broadcastId}`, {
      method: 'DELETE'
    });
  }
};


// =============================================================================
// DEFAULT EXPORT - All APIs in one object
// =============================================================================

/**
 * Export all API modules as a single object.
 * 
 * USAGE:
 *   import api from './services/api';
 *   await api.auth.login(credentials);
 *   await api.issues.getAll();
 */
export default {
  auth: authAPI,
  issues: issuesAPI,
  users: usersAPI,
  notifications: notificationsAPI,
  feed: feedAPI,
  analytics: analyticsAPI,
  broadcasts: broadcastsAPI
};
