/**
 * =============================================================================
 * CUSTOM DATA FETCHING HOOKS
 * =============================================================================
 * 
 * These hooks make it easy to load data from the backend API.
 * 
 * WHAT EACH HOOK RETURNS:
 *   - data      → The fetched data (null if not loaded yet)
 *   - loading   → true while fetching, false when done
 *   - error     → Error message if something went wrong, null otherwise
 *   - refetch   → Function to reload the data manually
 * 
 * HOW TO USE:
 * 
 *   import { useIssues } from '../hooks/useData';
 * 
 *   function MyComponent() {
 *     const { issues, loading, error, refetch } = useIssues({ status: 'pending' });
 *     
 *     if (loading) return <p>Loading...</p>;
 *     if (error) return <p>Error: {error}</p>;
 *     
 *     return (
 *       <ul>
 *         {issues.map(issue => <li key={issue.id}>{issue.title}</li>)}
 *       </ul>
 *     );
 *   }
 */

import { useState, useEffect, useCallback } from 'react';
import { issuesAPI, campaignsAPI, usersAPI, feedAPI } from '../services/api';


// =============================================================================
// HELPER HOOK (used by all hooks below)
// =============================================================================

/**
 * This is a helper hook that handles the common pattern:
 * 1. Call an API function
 * 2. Track loading/error states
 * 3. Store the result
 * 
 * Other hooks use this so they don't repeat the same code.
 */
function useApiData(fetchFn, params = {}) {
  // Store the API response here
  const [data, setData] = useState(null);
  
  // true = still loading, false = done loading
  const [loading, setLoading] = useState(true);
  
  // Error message if API call fails
  const [error, setError] = useState(null);
  
  // Convert params to text so React can detect when they change
  // (React can't compare objects directly in dependencies)
  const paramsString = JSON.stringify(params);

  // Function that calls the API
  const fetchData = useCallback(async () => {
    setLoading(true);    // Start loading
    setError(null);      // Clear any old errors
    
    try {
      // Convert params back from text to object
      const parsedParams = JSON.parse(paramsString);
      
      // Call the API
      const response = await fetchFn(parsedParams);
      
      // Save the data
      setData(response.data);
    } catch (err) {
      // Save the error message
      setError(err.message || 'Failed to fetch data');
      console.error('API Error:', err);
    } finally {
      setLoading(false);  // Done loading (success or error)
    }
  }, [fetchFn, paramsString]);

  // Call fetchData when the component loads or when params change
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

// =============================================================================
// ISSUES HOOKS - For loading issue/complaint data
// =============================================================================

/**
 * Load a list of issues (complaints reported by users)
 * 
 * FILTERS YOU CAN USE:
 *   - status: 'pending', 'inProgress', 'resolved', or 'rejected'
 *   - ward: ward number to filter by
 *   - search: text to search for
 *   - sort: 'newest' or 'oldest'
 * 
 * EXAMPLE:
 *   const { issues, loading } = useIssues({ status: 'pending' });
 * 
 * BACKEND API: GET /api/issues
 */
export const useIssues = (params = {}) => {
  const { data, loading, error, refetch } = useApiData(issuesAPI.getAll, params);
  
  return {
    issues: data?.issues || [],  // List of issues (empty array if none)
    total: data?.total || 0,     // Total number of issues (for pagination)
    page: data?.page || 1,       // Current page number
    loading,
    error,
    refetch,
  };
};

/**
 * Load a single issue by its ID
 * 
 * EXAMPLE:
 *   const { issue, loading } = useIssue('abc123');
 * 
 * BACKEND API: GET /api/issues/:id
 */
export const useIssue = (id) => {
  // Create a function that fetches this specific issue
  const fetchIssue = useCallback(() => issuesAPI.getById(id), [id]);
  
  const { data, loading, error, refetch } = useApiData(fetchIssue, {});
  
  return { issue: data, loading, error, refetch };
};

// =============================================================================
// USERS HOOKS - For loading user data (admin only)
// =============================================================================

/**
 * Load a list of users (only admins can access this)
 * 
 * FILTERS YOU CAN USE:
 *   - kycStatus: 'verified', 'pending', or 'rejected'
 *   - search: search by name, email, or phone
 *   - sort: 'newest' or 'oldest'
 * 
 * EXAMPLE:
 *   const { users, loading } = useUsers({ kycStatus: 'pending' });
 * 
 * BACKEND API: GET /api/users
 */
export const useUsers = (params = {}) => {
  const { data, loading, error, refetch } = useApiData(usersAPI.getAll, params);
  
  return {
    users: data?.users || [],
    total: data?.total || 0,
    loading,
    error,
    refetch,
  };
};

/**
 * Load a single user by their ID
 * 
 * EXAMPLE:
 *   const { user, loading } = useUser('user123');
 * 
 * BACKEND API: GET /api/users/:id
 */
export const useUser = (id) => {
  const fetchUser = useCallback(() => usersAPI.getById(id), [id]);
  const { data, loading, error, refetch } = useApiData(fetchUser, {});
  
  return { user: data, loading, error, refetch };
};

// =============================================================================
// NEWS FEED HOOKS - For loading community feed
// =============================================================================

/**
 * Load the community news feed
 * Shows issues, programs, and notices from the community
 * 
 * FILTERS YOU CAN USE:
 *   - type: 'issue', 'program', or 'notice'
 *   - ward: ward number to filter by
 *   - search: text to search for
 * 
 * EXAMPLE:
 *   const { feed, loading } = useFeed({ type: 'issue' });
 * 
 * BACKEND API: GET /api/feed
 */
export const useFeed = (params = {}) => {
  const { data, loading, error, refetch } = useApiData(feedAPI.getAll, params);
  
  return { feed: data || [], loading, error, refetch };
};

// =============================================================================
// CAMPAIGNS HOOKS - For loading campaign request data
// =============================================================================

/**
 * Load a list of campaign requests
 * 
 * FILTERS YOU CAN USE:
 *   - status: 'pending', 'approved', 'rejected', or 'completed'
 *   - ward: ward number to filter by
 *   - category: campaign category
 *   - search: text to search for
 *   - sort: 'newest' or 'oldest'
 * 
 * EXAMPLE:
 *   const { campaigns, loading } = useCampaigns({ status: 'pending' });
 * 
 * BACKEND API: GET /api/campaigns
 */
export const useCampaigns = (params = {}) => {
  const { data, loading, error, refetch } = useApiData(campaignsAPI.getAll, params);
  
  return {
    campaigns: data?.campaigns || [],  // List of campaigns (empty array if none)
    total: data?.total || 0,           // Total number of campaigns (for pagination)
    page: data?.page || 1,             // Current page number
    totalPages: data?.totalPages || 1, // Total pages
    loading,
    error,
    refetch,
  };
};

/**
 * Load a single campaign by its ID
 * 
 * EXAMPLE:
 *   const { campaign, loading } = useCampaign('abc123');
 * 
 * BACKEND API: GET /api/campaigns/:id
 */
export const useCampaign = (id) => {
  // Create a function that fetches this specific campaign
  const fetchCampaign = useCallback(() => campaignsAPI.getById(id), [id]);
  
  const { data, loading, error, refetch } = useApiData(fetchCampaign, {});
  
  return { campaign: data, loading, error, refetch };
};


// =============================================================================
// ANALYTICS HOOKS - For loading dashboard statistics (admin only)
// =============================================================================

/**
 * Load analytics data for the admin dashboard
 * 
 * This hook is special because it fetches from 3 different endpoints
 * at the same time (in parallel) for better performance:
 *   1. Overview stats (total users, issues, etc.)
 *   2. Issue breakdown (by type, status, ward)
 *   3. Monthly trends
 * 
 * FILTERS YOU CAN USE:
 *   - ward: filter by specific ward (super admin only)
 *   - period: 'week', 'month', or 'year'
 * 
 * EXAMPLE:
 *   const { analytics, loading } = useAnalytics({ period: 'month' });
 *   // analytics.overview - general stats
 *   // analytics.issuesByType - breakdown by issue type
 *   // analytics.monthlyTrends - trend data for charts
 * 
 * BACKEND APIs:
 *   - GET /api/analytics/overview
 *   - GET /api/analytics/issues  
 *   - GET /api/analytics/trends
 */
export const useAnalytics = (params = {}) => {
  // Store combined analytics data
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Convert params to text for change detection
  const paramsString = JSON.stringify(params);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const parsedParams = JSON.parse(paramsString);
      
      // Fetch all 3 endpoints at the same time (faster than one by one)
      const [overview, issueStats, trends] = await Promise.all([
        analyticsAPI.getOverview(parsedParams),
        analyticsAPI.getIssueStats(parsedParams),
        analyticsAPI.getTrends(parsedParams),
      ]);
      
      // Combine all the data into one object
      setAnalytics({
        overview: overview.data,                       // General stats
        issuesByType: issueStats.data?.byType || [],   // Issues grouped by type
        issuesByStatus: issueStats.data?.byStatus || [],// Issues grouped by status
        issuesByWard: issueStats.data?.byWard || [],   // Issues grouped by ward
        monthlyTrends: trends.data || [],              // Monthly trend data
      });
    } catch (err) {
      setError(err.message || 'Failed to fetch analytics');
    } finally {
      setLoading(false);
    }
  }, [paramsString]);

  // Fetch when component loads or params change
  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return { analytics, loading, error, refetch: fetchAnalytics };
};

// =============================================================================
// ADMIN HOOKS - For admin dashboard functionality
// =============================================================================

/**
 * Load dashboard statistics for admin panel
 * Fetches issue stats, user stats, and campaign stats
 * Automatically filtered by ward for ward admins
 * 
 * EXAMPLE:
 *   const { stats, loading } = useDashboardStats();
 * 
 * BACKEND API: GET /api/admin/dashboard/stats
 */
export const useDashboardStats = () => {
  const { data, loading, error, refetch } = useApiData(adminAPI.getDashboardStats, {});
  
  return {
    stats: data || {
      issues: { total: 0, pending: 0, inProgress: 0, resolved: 0 },
      users: { total: 0, verified: 0, pendingKyc: 0 },
      campaigns: { total: 0, pending: 0, approved: 0 }
    },
    loading,
    error,
    refetch,
  };
};


// =============================================================================
// EXPORT ALL HOOKS
// =============================================================================

export default {
  useIssues,
  useIssue,
  useUsers,
  useUser,
  useNotifications,
  useBroadcasts,
  useCampaigns,
  useCampaign,
  useFeed,
  useAnalytics,
};
