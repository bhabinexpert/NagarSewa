/**
 * =============================================================================
 * API SERVICE - Backend Communication with Axios
 * =============================================================================
 */

import axios from 'axios';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:2026/api';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds
});

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
    return Promise.reject(new Error(message));
  }
);

// =============================================================================
// AUTHENTICATION API
// =============================================================================

export const authAPI = {
  register: (userData) => apiClient.post('/auth/register', userData),
  login: (credentials) => apiClient.post('/auth/login', credentials),
  logout: () => apiClient.post('/auth/logout'),
  getMe: () => apiClient.get('/auth/me'),
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
  
  create: (issueData) => apiClient.post('/issues', issueData),
  
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
  
  verifyKYC: (id, kyc_status) => 
    apiClient.patch(`/admin/users/${id}/kyc`, { status: kyc_status }),
  
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
// EXPORT DEFAULT FOR BACKWARD COMPATIBILITY
// =============================================================================

const apiService = {
  auth: authAPI,
  issues: issuesAPI,
  campaigns: campaignsAPI,
  admin: adminAPI,
  users: usersAPI,
  feed: feedAPI,
};

export default apiService;
