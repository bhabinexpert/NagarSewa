/**
 * =============================================================================
 * API SERVICE - Backend Communication with Axios
 * =============================================================================
 */

import axios from 'axios';

// API Configuration
const rawApiUrl = (import.meta.env.VITE_API_URL || 'http://localhost:2026/api').trim();
const API_BASE_URL = rawApiUrl.endsWith('/api') ? rawApiUrl : `${rawApiUrl.replace(/\/$/, '')}/api`;

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds
});

let getMeInFlightPromise = null;
let getMeBlockedUntil = 0;
let getMeLastResponse = null;
let getMeLastSuccessAt = 0;
const GET_ME_CACHE_MS = 2000;

function clearGetMeCache() {
  getMeInFlightPromise = null;
  getMeBlockedUntil = 0;
  getMeLastResponse = null;
  getMeLastSuccessAt = 0;
}

async function getMeWithGuard(options = {}) {
  const forceRefresh = Boolean(options.forceRefresh);
  const now = Date.now();

  if (!forceRefresh && getMeBlockedUntil > now) {
    const retryAfterSeconds = Math.max(1, Math.ceil((getMeBlockedUntil - now) / 1000));
    const limitedError = new Error('Too many requests. Please wait a few minutes before trying again.');
    limitedError.status = 429;
    limitedError.retryAfter = retryAfterSeconds;
    throw limitedError;
  }

  if (!forceRefresh && getMeInFlightPromise) {
    return getMeInFlightPromise;
  }

  if (
    !forceRefresh &&
    getMeLastResponse &&
    now - getMeLastSuccessAt < GET_ME_CACHE_MS
  ) {
    return getMeLastResponse;
  }

  getMeInFlightPromise = apiClient
    .get('/auth/me')
    .then((response) => {
      getMeLastResponse = response;
      getMeLastSuccessAt = Date.now();
      return response;
    })
    .catch((error) => {
      if (error?.status === 429) {
        const retryAfterSeconds = Number(error.retryAfter) || 60;
        getMeBlockedUntil = Date.now() + retryAfterSeconds * 1000;
      }
      throw error;
    })
    .finally(() => {
      getMeInFlightPromise = null;
    });

  return getMeInFlightPromise;
}

// Request interceptor - Add auth token to all requests
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors globally
apiClient.interceptors.response.use(
  (response) => {
    return response.data; // Return only data
  },
  (error) => {
    const message = error.response?.data?.message || error.message || 'Something went wrong';
    const enhancedError = new Error(message);
    enhancedError.status = error.response?.status;
    enhancedError.code = error.code;
    
    // Pass through additional data from backend error responses (e.g., isDisabled flag)
    if (error.response?.data?.data) {
      enhancedError.data = error.response.data.data;
    }

    const retryAfterHeader = error.response?.headers?.['retry-after'];
    if (retryAfterHeader !== undefined) {
      const parsedRetryAfter = Number(retryAfterHeader);
      if (Number.isFinite(parsedRetryAfter) && parsedRetryAfter > 0) {
        enhancedError.retryAfter = parsedRetryAfter;
      }
    }

    return Promise.reject(enhancedError);
  }
);

// =============================================================================
// AUTHENTICATION API
// =============================================================================

export const authAPI = {
  register: (userData) => apiClient.post('/auth/register', userData),
  login: async (credentials) => {
    const response = await apiClient.post('/auth/login', credentials);
    clearGetMeCache();
    return response;
  },
  logout: async () => {
    const response = await apiClient.post('/auth/logout');
    clearGetMeCache();
    return response;
  },
  getMe: (options) => getMeWithGuard(options),
};

// =============================================================================
// ISSUES API
// =============================================================================

export const issuesAPI = {
  getAll: (filters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value);
      }
    });
    return apiClient.get(`/issues?${params.toString()}`);
  },
  
  getById: (id) => apiClient.get(`/issues/${id}`),
  
  create: (issueData) => {
    // When sending files, keep request as multipart/form-data so Multer can read req.files.
    if (issueData instanceof FormData) {
      return apiClient.post('/issues', issueData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    }

    // Fallback for non-file payloads.
    return apiClient.post('/issues', issueData);
  },
  
  updateStatus: (id, status, resolution_note) => 
    apiClient.patch(`/issues/${id}/status`, { status, resolution_note }),
  
  setPriority: (id, priority, priority_note) => 
    apiClient.patch(`/issues/${id}/priority`, { priority, priority_note }),
};

// =============================================================================
// CAMPAIGNS API
// =============================================================================

export const campaignsAPI = {
  getAll: (filters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value);
      }
    });
    return apiClient.get(`/campaigns?${params.toString()}`);
  },
  
  getById: (id) => apiClient.get(`/campaigns/${id}`),
  
  create: (campaignData) => apiClient.post('/campaigns', campaignData),
  
  updateStatus: (id, status, admin_response) => 
    apiClient.patch(`/campaigns/${id}/status`, { status, admin_response }),
};

// =============================================================================
// ADMIN API
// =============================================================================

export const adminAPI = {
  // Dashboard stats
  getDashboardStats: () => apiClient.get('/admin/dashboard/stats'),
  
  // Analytics
  getAnalyticsOverview: () => apiClient.get('/admin/analytics/overview'),
  getIssueAnalytics: () => apiClient.get('/admin/analytics/issues'),
  getTrends: () => apiClient.get('/admin/analytics/trends'),
  
  // User management
  getUsers: (filters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value);
      }
    });
    return apiClient.get(`/admin/users?${params.toString()}`);
  },
  
  getUserById: (id) => apiClient.get(`/admin/users/${id}`),
  
  disableUser: (id) => apiClient.patch(`/admin/users/${id}/disable`),
  
  enableUser: (id) => apiClient.patch(`/admin/users/${id}/enable`),
  
  verifyKYC: (id, kyc_status, rejectionReason) =>
    apiClient.patch(`/admin/users/${id}/kyc`, {
      status: kyc_status,
      ...(rejectionReason && { rejectionReason })
    }),
  
  // Ward admin management
  getWardAdmins: () => apiClient.get('/admin/ward-admins'),
  
  createWardAdmin: (adminData) => apiClient.post('/admin/ward-admins', adminData),
  
  deactivateWardAdmin: (id) => apiClient.patch(`/admin/ward-admins/${id}/deactivate`),
  
  reactivateWardAdmin: (id) => apiClient.patch(`/admin/ward-admins/${id}/reactivate`),
  
  // Admin profile management
  updateProfile: (profileData) => apiClient.patch('/admin/profile', profileData),
  
  changePassword: (passwordData) => apiClient.patch('/admin/password', passwordData),
};

// =============================================================================
// USERS API (User Profile Management)
// =============================================================================

export const usersAPI = {
  // Get current user's profile
  getMe: () => apiClient.get('/users/me'),
  
  // Get all users (admin only)
  getAll: (filters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value);
      }
    });
    return apiClient.get(`/users?${params.toString()}`);
  },
  
  // Get user by ID
  getById: (id) => apiClient.get(`/users/${id}`),
  
  // Update user profile
  updateProfile: (id, profileData) =>
    apiClient.patch(`/users/${id}/profile`, profileData),

  // Submit KYC documents
  submitKYC: (id, kycData) => {
    // kycData should be a FormData object with files
    return apiClient.post(`/users/${id}/kyc`, kycData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Update/Resubmit KYC documents
  updateKYC: (id, kycData) => {
    // kycData should be a FormData object with files
    return apiClient.patch(`/users/${id}/kyc`, kycData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

// =============================================================================
// FEED API (Community News Feed)
// =============================================================================

export const feedAPI = {
  // Get community feed
  getAll: (filters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value);
      }
    });
    return apiClient.get(`/feed?${params.toString()}`);
  },
};

// =============================================================================
// BROADCASTS API (Admin Broadcasts)
// =============================================================================

export const broadcastsAPI = {
  // Send a broadcast (admin only)
  send: (payload) => apiClient.post('/broadcasts', payload),

  // Get super admin broadcasts for admin tab
  getAdmin: () => apiClient.get('/broadcasts'),
};

// =============================================================================
// EXPORT DEFAULT FOR BACKWARD COMPATIBILITY
// =============================================================================

const apiService = {
  auth: authAPI,
  issues: issuesAPI,
  campaigns: campaignsAPI,
  admin: adminAPI,
  users: usersAPI,
  feed: feedAPI,
  broadcasts: broadcastsAPI,
};

export default apiService;
