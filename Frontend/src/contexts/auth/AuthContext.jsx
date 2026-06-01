/**
 * AUTHENTICATION PROVIDER - Manages User Login State with Backend Integration
 * This is the main authentication component for the app.
 * It handles:
 * - User login and logout with real backend API
 * - Storing user session in browser
 * - Role-based access control (super admin, ward admin, regular user)
 * - Real-time state updates with useEffect
 * 
 * HOW IT WORKS:
 * 1. When app loads, it checks if there's a saved token in sessionStorage
 * 2. When user logs in, it calls the backend API and stores the token
 * 3. When user logs out, it clears the session
 * 4. All components can access user info through the useAuth() hook
 */

import { useState, useEffect } from "react";
import { AuthContext, DAMAK_TOTAL_WARDS, ROLES } from "./authConstants";
import api from "../../services/api";


export function AuthProvider({ children }) {
  
  
  /**
   * The currently logged-in user.
   * null if no one is logged in.
   */
  const [currentUser, setCurrentUser] = useState(null);
  
  /**
   * Loading state for async operations.
   */
  const [isLoading, setIsLoading] = useState(true);
  
  /**
   * List of all ward administrators (for super admin).
   */
  const [wardAdmins, setWardAdmins] = useState([]);

  /**
   * List of disabled users (admin-only tracking).
   */
  const [disabledUsers, setDisabledUsers] = useState([]);
  
  
  /**
   * On component mount, check if user is already logged in.
   * If there's a token, validate it with the backend (non-blocking).
   */
  useEffect(function() {
    async function checkAuth() {
      const token = sessionStorage.getItem("authToken");
      const savedUser = sessionStorage.getItem("nagarsewa_user");
      
      if (token && savedUser) {
        try {
          // Parse saved user and normalize field names (handle old format)
          const parsedUser = JSON.parse(savedUser);
          const normalizedUser = {
            ...parsedUser,
            fullName: parsedUser.fullName || parsedUser.full_name,
            wardNumber: parsedUser.wardNumber || parsedUser.ward_number,
            dateOfBirth: parsedUser.dateOfBirth || parsedUser.date_of_birth,
            kycVerified: parsedUser.kycVerified || parsedUser.kyc_status === 'VERIFIED',
            kycStatus: parsedUser.kycStatus || parsedUser.kyc_status
          };
          
          // Set the normalized user immediately to prevent redirect
          setCurrentUser(normalizedUser);
          
          // Validate token with backend (non-blocking, with timeout)
          // Use Promise.race to timeout after 8 seconds
          const validationPromise = api.auth.getMe();
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Validation timeout')), 8000)
          );
          
          try {
            const response = await Promise.race([validationPromise, timeoutPromise]);

            // The API envelope is { success, message, data: { user } }. Reading
            // response.user directly silently dropped the fresh data (including
            // kycDocuments), so fall back through both shapes.
            const freshUser = response?.data?.user || response?.user;
            if (freshUser) {
              setCurrentUser(freshUser);
            }
          } catch (validationError) {
            // If validation times out or fails, it's not blocking - user stays logged in
            // Only clear session for actual auth failures (401/403)
            if (validationError?.status === 401 || validationError?.status === 403) {
              sessionStorage.removeItem("authToken");
              sessionStorage.removeItem("nagarsewa_user");
              setCurrentUser(null);
            }
            // For network errors or timeouts, silently continue - user stays logged in with cached data
          }
        } catch (error) {
          console.error('Auth initialization error:', error);

          // Clear session only for actual auth failures
          if (error?.status === 401 || error?.status === 403) {
            sessionStorage.removeItem("authToken");
            sessionStorage.removeItem("nagarsewa_user");
            setCurrentUser(null);
          }
        } finally {
          // Always set loading to false, whether success or error
          setIsLoading(false);
        }
      } else {
        // No token or saved user, not logged in
        setIsLoading(false);
      }
    }
    
    checkAuth();
  }, []);
  
  /**
   * Save user to sessionStorage whenever it changes.
   */
  useEffect(function() {
    if (currentUser) {
      sessionStorage.setItem("nagarsewa_user", JSON.stringify(currentUser));
    } else {
      sessionStorage.removeItem("nagarsewa_user");
    }
  }, [currentUser]);
  
  /**
   * Load ward admins manually (called by SuperAdminPanel when needed).
   */
  async function loadWardAdmins() {
    if (currentUser && String(currentUser.role || '').toUpperCase() === ROLES.SUPER_ADMIN) {
      try {
        const response = await api.admin.getWardAdmins();
        const formattedAdmins = response.admins.map(admin => ({
          id: admin.id,
          email: admin.email,
          fullName: admin.full_name,
          role: ROLES.WARD_ADMIN,
          wardNumber: Number(admin.ward_number),
          phone: admin.phone,
          isActive: typeof admin.isActive === 'boolean' ? admin.isActive : !admin.is_disabled,
          createdAt: admin.createdAt || admin.created_at
        }));

        // Keep both active and inactive admins for counts and tab filtering.
        setWardAdmins(formattedAdmins);
        return formattedAdmins;
      } catch (error) {
        console.error('Error loading ward admins:', error);
        throw error;
      }
    }
  }
  
  
  // =========================================================================
  // AUTHENTICATION FUNCTIONS
  // =========================================================================
  
  /**
   * Log in a user with email and password using backend API.
   * 
   * @param {string} email - User's email address
   * @param {string} password - User's password
   * @returns {Object} Result with success status and user/error info
   */
  async function login(email, password) {
    try {
      setIsLoading(true);
      
      // Call backend API
      const response = await api.auth.login({ email, password });
      
      // Backend wraps data in response.data
      const { token, user, redirectTo } = response.data || response;
      
      // Store token
      sessionStorage.setItem("authToken", token);
      
      // Set user in state
      setCurrentUser(user);
      
      setIsLoading(false);
      
      return { 
        success: true, 
        user: user, 
        redirectTo: redirectTo || (user.role === 'user' ? '/user' : '/admin')
      };
      
    } catch (error) {
      setIsLoading(false);
      
      // Check if account is disabled (backend returns 403 with isDisabled flag)
      const isDisabled = error.data?.isDisabled || error.message?.includes('disabled');
      
      return {
        success: false,
        error: error.message || "Login failed. Please check your credentials.",
        isDisabled: isDisabled
      };
    }
  }
  
  /**
   * Log out the current user.
   * Clears the user from state and removes token.
   */
  function logout() {
    setCurrentUser(null);
    sessionStorage.removeItem("authToken");
    sessionStorage.removeItem("nagarsewa_user");
  }
  
  /**
   * Update current user's profile information.
   * Updates both state and sessionStorage.
   * @param {Object} updates - Profile fields to update (fullName, phone, etc.)
   */
  function updateProfile(updates) {
    const updatedUser = {
      ...currentUser,
      ...updates,
      // Map full_name to fullName if provided
      fullName: updates.full_name || updates.fullName || currentUser.fullName
    };
    setCurrentUser(updatedUser);
    sessionStorage.setItem("nagarsewa_user", JSON.stringify(updatedUser));
  }  
  /**
   * Refresh current user data from backend.
   * Fetches the latest user data and updates the context.
   */
  async function refreshUser() {
    try {
      const response = await api.auth.getMe();
      const freshUser = response?.data?.user || response?.user;
      if (freshUser) {
        setCurrentUser(freshUser);
        sessionStorage.setItem("nagarsewa_user", JSON.stringify(freshUser));
        return freshUser;
      }
    } catch (error) {
      console.error('Error refreshing user data:', error);
      throw error;
    }
  }  
  
  // =========================================================================
  // ROLE CHECKING FUNCTIONS
  // =========================================================================
  
  /**
   * Check if the current user is a super admin.
   * @returns {boolean} true if super admin, false otherwise
   */
  function isSuperAdmin() {
    return currentUser?.role?.toUpperCase() === 'SUPER_ADMIN';
  }
  
  /**
   * Check if the current user is a ward admin.
   * @returns {boolean} true if ward admin, false otherwise
   */
  function isWardAdmin() {
    return currentUser?.role?.toUpperCase() === 'WARD_ADMIN';
  }
  
  /**
   * Check if the current user is a regular user.
   * @returns {boolean} true if regular user, false otherwise
   */
  function isUser() {
    return currentUser?.role === ROLES.USER;
  }
  
  /**
   * Get the ward number of the current user (for ward admins).
   * @returns {number|null} Ward number or null if not a ward admin
   */
  function getUserWard() {
    return currentUser?.wardNumber || null;
  }
  
  
  // =========================================================================
  // KYC (Know Your Customer) FUNCTIONS
  // =========================================================================
  
  /**
   * Mark the current user's KYC as verified.
   * This is for demo purposes - in a real app, an admin would verify this.
   * 
   * @returns {Object} Success/failure result
   */
  function verifyKyc() {
    if (currentUser) {
      const updatedUser = {
        ...currentUser,
        kycVerified: true
      };
      setCurrentUser(updatedUser);
      return { success: true };
    }
    return { success: false, error: "No user logged in" };
  }
  
  /**
   * Check if the current user's KYC is verified.
   * @returns {boolean} true if verified, false otherwise
   */
  function isKycVerified() {
    return currentUser?.kycVerified || false;
  }
  
  
  // =========================================================================
  // SUPER ADMIN FUNCTIONS - Ward Admin Management
  // =========================================================================
  
  /**
   * Create a new ward admin account using backend API.
   * Only super admin can do this.
   * 
   * @param {Object} adminData - The new admin's information
   * @returns {Object} Success/failure result
   */
  async function createWardAdmin(adminData) {
    if (!isSuperAdmin()) {
      return { success: false, error: "Only super admin can create ward admins" };
    }
    
    try {
      // Call backend API
      const response = await api.admin.createWardAdmin({
        full_name: adminData.fullName,
        email: adminData.email,
        phone: adminData.phone,
        ward_number: adminData.wardNumber,
        password: adminData.password
      });
      
      // Backend returns { message, admin } directly (not wrapped in data)
      const createdAdmin = response.admin || response;
      
      // Add to local state with functional update for immediate UI refresh
      const newAdmin = {
        id: createdAdmin.id,
        email: createdAdmin.email,
        fullName: createdAdmin.full_name,
        role: ROLES.WARD_ADMIN,
        wardNumber: Number(createdAdmin.ward_number),
        phone: createdAdmin.phone,
        isActive: typeof createdAdmin.isActive === 'boolean' ? createdAdmin.isActive : !createdAdmin.is_disabled,
        createdAt: createdAdmin.created_at || createdAdmin.createdAt
      };
      
      setWardAdmins(prevAdmins => [...prevAdmins, newAdmin]);

      // Keep UI fully aligned with backend constraints and latest status.
      try {
        await loadWardAdmins();
      } catch (refreshError) {
        console.error('Failed to refresh ward admins after create:', refreshError);
      }
      
      return { success: true, admin: newAdmin };
    } catch (error) {
      return { success: false, error: error.message || "Failed to create ward admin" };
    }
  }
  
  /**
   * Update a ward admin's information.
   * Only super admin can do this.
   * 
   * @param {string} adminId - The admin's ID
   * @param {Object} updates - The fields to update
   * @returns {Object} Success/failure result
   */
  function updateWardAdmin(adminId, updates) {
    if (!isSuperAdmin()) {
      return { success: false, error: "Only super admin can update ward admins" };
    }
    
    setWardAdmins(prevAdmins => 
      prevAdmins.map(admin => 
        admin.id === adminId ? { ...admin, ...updates } : admin
      )
    );
    
    return { success: true };
  }
  
  /**
   * Deactivate a ward admin account using backend API.
   * Only super admin can do this.
   * 
   * @param {string} adminId - The admin's ID
   * @returns {Object} Success/failure result
   */
  async function deactivateWardAdmin(adminId) {
    if (!isSuperAdmin()) {
      return { success: false, error: "Only super admin can deactivate ward admins" };
    }

    try {
      console.log("[AuthContext] Deactivating admin:", adminId);
      const result = await api.admin.deactivateWardAdmin(adminId);
      console.log("[AuthContext] Deactivate API response:", result);
      
      // Refresh the admin list from server to get the latest state
      try {
        console.log("[AuthContext] Refreshing admin list after deactivation");
        await loadWardAdmins();
      } catch (refreshError) {
        console.error('Failed to refresh ward admins after deactivation:', refreshError);
      }
      
      return { success: true };
    } catch (error) {
      console.error("[AuthContext] Deactivate error:", error);
      console.error("[AuthContext] Error status:", error?.status);
      console.error("[AuthContext] Error message:", error?.message);
      
      if (error?.status === 404) {
        // Stale UI row: remove it locally and sync list from server.
        console.warn("[AuthContext] Admin ID not found (404), refreshing list");
        try {
          await loadWardAdmins();
        } catch (refreshError) {
          console.error('Failed to refresh ward admins after 404 deactivation:', refreshError);
        }
        return { success: false, error: "Selected admin was not found. The list has been refreshed." };
      }
      return { success: false, error: error.message || "Failed to deactivate admin" };
    }
  }
  
  /**
   * Reactivate a deactivated ward admin using backend API.
   * Only super admin can do this.
   * 
   * @param {string} adminId - The admin's ID
   * @returns {Object} Success/failure result
   */
  async function reactivateWardAdmin(adminId) {
    if (!isSuperAdmin()) {
      return { success: false, error: "Only super admin can reactivate ward admins" };
    }
    
    try {
      await api.admin.reactivateWardAdmin(adminId);
      
      // Refresh the admin list from server to get the latest state
      try {
        await loadWardAdmins();
      } catch (refreshError) {
        console.error('Failed to refresh ward admins after reactivation:', refreshError);
      }
      
      return { success: true };
    } catch (error) {
      if (error?.status === 404) {
        // Stale UI row: remove it locally and sync list from server.
        try {
          await loadWardAdmins();
        } catch (refreshError) {
          console.error('Failed to refresh ward admins after 404 reactivation:', refreshError);
        }
        return { success: false, error: "Selected admin was not found. The list has been refreshed." };
      }
      return { success: false, error: error.message || "Failed to reactivate admin" };
    }
  }
  
  /**
   * Get a list of all ward admins.
   * Only super admin can access this.
   * 
   * @returns {Array} List of ward admins
   */
  function getWardAdmins() {
    if (!isSuperAdmin()) {
      return [];
    }
    return wardAdmins;
  }
  
  /**
   * Get a list of wards that don't have an admin assigned.
   * Only super admin can access this.
   * 
   * @returns {Array} List of ward numbers without admins
   */
  function getWardsWithoutAdmin() {
    if (!isSuperAdmin()) {
      return [];
    }
    
    // Get list of wards that have active admins
    const assignedWards = (wardAdmins || [])
      .filter(function(admin) {
        return admin.isActive;
      })
      .map(function(admin) {
        return Number(admin.wardNumber);
      });
    
    // Generate list of all wards (1 to 10) using Array.from
    const allWards = Array.from({ length: DAMAK_TOTAL_WARDS }, function(_, index) {
      return index + 1;
    });
    
    // Return wards that are not in assignedWards
    return allWards.filter(function(ward) {
      return !assignedWards.includes(ward);
    });
  }
  
  
  // =========================================================================
  // DATA FILTERING FUNCTIONS
  // =========================================================================
  
  /**
   * Filter data based on user's role and jurisdiction.
   * 
   * - Super admin sees everything
   * - Ward admin sees only their ward's data
   * - Regular user sees only their own data
   * 
   * @param {Array} data - The data to filter
   * @param {string} wardField - The field name that contains ward number
   * @returns {Array} Filtered data
   */
  function filterDataByJurisdiction(data, wardField = "wardNumber") {
    if (!currentUser) {
      return [];
    }
    
    // Super admin sees all data
    if (isSuperAdmin()) {
      return data;
    }
    
    // Ward admin sees only their ward's data
    if (isWardAdmin()) {
      return data.filter(function(item) {
        return item[wardField] === currentUser.wardNumber;
      });
    }
    
    // Regular user sees only their own data
    return data.filter(function(item) {
      return item.userId === currentUser.id;
    });
  }
  
  
  // =========================================================================
  // USER ACCOUNT MANAGEMENT (Admin Functions)
  // =========================================================================
  
  /**
   * Disable a user account.
   * Only admins can do this. Disabled users cannot log in.
   * 
   * @param {string} userEmail - The user's email to disable
   * @param {string} reason - Why the account is being disabled
   * @returns {Object} Success/failure result
   */
  function disableUser(userEmail, reason = "Account disabled by administrator") {
    // Only admins can disable users
    if (!isSuperAdmin() && !isWardAdmin()) {
      return { success: false, error: "Only admins can disable user accounts" };
    }
    
    // Check if already disabled
    const alreadyDisabled = disabledUsers.find(function(u) {
      return u.email.toLowerCase() === userEmail.toLowerCase();
    });
    
    if (alreadyDisabled) {
      return { success: false, error: "User is already disabled" };
    }
    
    // Create disabled entry
    const disabledEntry = {
      email: userEmail.toLowerCase(),
      disabledAt: new Date().toISOString(),
      reason: reason,
      disabledBy: currentUser.email
    };
    
    // Add to disabled list
    setDisabledUsers([...disabledUsers, disabledEntry]);
    
    // If the disabled user is currently logged in, log them out
    if (currentUser && currentUser.email.toLowerCase() === userEmail.toLowerCase()) {
      logout();
    }
    
    return { success: true };
  }
  
  /**
   * Enable a disabled user account.
   * Only admins can do this.
   * 
   * @param {string} userEmail - The user's email to enable
   * @returns {Object} Success/failure result
   */
  function enableUser(userEmail) {
    if (!isSuperAdmin() && !isWardAdmin()) {
      return { success: false, error: "Only admins can enable user accounts" };
    }
    
    // Remove from disabled list
    const updatedDisabledUsers = disabledUsers.filter(function(u) {
      return u.email.toLowerCase() !== userEmail.toLowerCase();
    });
    
    setDisabledUsers(updatedDisabledUsers);
    return { success: true };
  }
  
  /**
   * Check if a specific user is disabled.
   * 
   * @param {string} userEmail - The email to check
   * @returns {boolean} true if disabled, false otherwise
   */
  function isUserDisabledCheck(userEmail) {
    return disabledUsers.some(function(u) {
      return u.email.toLowerCase() === userEmail.toLowerCase();
    });
  }
  
  /**
   * Get list of all disabled users.
   * Only admins can access this.
   * 
   * @returns {Array} List of disabled user entries
   */
  function getDisabledUsers() {
    if (!isSuperAdmin() && !isWardAdmin()) {
      return [];
    }
    return disabledUsers;
  }
  
  
  // =========================================================================
  // CONTEXT VALUE - What we provide to child components
  // =========================================================================
  
  const contextValue = {
    // Current user info
    currentUser: currentUser,
    isLoading: isLoading,
    
    // Auth functions
    login: login,
    logout: logout,
    updateProfile: updateProfile,
    refreshUser: refreshUser,
    
    // Role checking functions
    isSuperAdmin: isSuperAdmin,
    isWardAdmin: isWardAdmin,
    isUser: isUser,
    getUserWard: getUserWard,
    
    // KYC functions
    verifyKyc: verifyKyc,
    isKycVerified: isKycVerified,
    
    // User account management
    disableUser: disableUser,
    enableUser: enableUser,
    isUserDisabled: isUserDisabledCheck,
    getDisabledUsers: getDisabledUsers,
    
    // Super admin functions
    createWardAdmin: createWardAdmin,
    updateWardAdmin: updateWardAdmin,
    deactivateWardAdmin: deactivateWardAdmin,
    reactivateWardAdmin: reactivateWardAdmin,
    getWardAdmins: getWardAdmins,
    getWardsWithoutAdmin: getWardsWithoutAdmin,
    loadWardAdmins: loadWardAdmins,
    
    // Data filtering
    filterDataByJurisdiction: filterDataByJurisdiction,
    
    // Constants (useful for components)
    ROLES: ROLES,
    DAMAK_TOTAL_WARDS: DAMAK_TOTAL_WARDS
  };
  
  
  // =========================================================================
  // RENDER
  // =========================================================================
  
  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}
