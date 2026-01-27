/**
 * =============================================================================
 * AUTHENTICATION PROVIDER - Manages User Login State
 * =============================================================================
 * 
 * This is the main authentication component for the app.
 * It handles:
 * - User login and logout
 * - Storing user session in browser
 * - Role-based access control (super admin, ward admin, regular user)
 * - Ward admin management
 * 
 * HOW IT WORKS:
 * 1. When app loads, it checks if there's a saved user in localStorage
 * 2. When user logs in, it validates credentials and creates a session
 * 3. When user logs out, it clears the session
 * 4. All components can access user info through the useAuth() hook
 */

import { useState, useEffect } from "react";
import { AuthContext, DAMAK_TOTAL_WARDS, ROLES, mockWardAdmins, superAdminCredentials } from "./authConstants";


/**
 * Auth Provider Component
 * 
 * Wrap your app with this to enable authentication.
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - The app content
 */
export function AuthProvider({ children }) {
  
  // =========================================================================
  // STATE VARIABLES
  // =========================================================================
  
  /**
   * The currently logged-in user.
   * null if no one is logged in.
   * 
   * We initialize from localStorage so the user stays logged in
   * even after refreshing the page.
   */
  const [currentUser, setCurrentUser] = useState(function() {
    // Try to load saved user from browser storage
    const savedUser = localStorage.getItem("nagarsewa_user");
    
    if (savedUser) {
      try {
        // Parse the JSON string back to an object
        return JSON.parse(savedUser);
      } catch {
        // If parsing fails, remove the corrupted data
        localStorage.removeItem("nagarsewa_user");
        return null;
      }
    }
    
    return null;
  });
  
  /**
   * List of all ward administrators.
   * In a real app, this would come from the backend.
   */
  const [wardAdmins, setWardAdmins] = useState(mockWardAdmins);
  
  /**
   * List of disabled user accounts.
   * Disabled users cannot log in.
   */
  const [disabledUsers, setDisabledUsers] = useState(function() {
    const savedDisabled = localStorage.getItem("nagarsewa_disabled_users");
    
    if (savedDisabled) {
      try {
        return JSON.parse(savedDisabled);
      } catch {
        return [];
      }
    }
    
    return [];
  });
  
  /**
   * Loading state for async operations.
   * Currently not used but available for future API calls.
   */
  const [isLoading] = useState(false);
  
  
  // =========================================================================
  // SIDE EFFECTS - Things that happen automatically
  // =========================================================================
  
  /**
   * Save the current user to localStorage whenever it changes.
   * This keeps the user logged in even after page refresh.
   */
  useEffect(function() {
    if (currentUser) {
      // Save user to browser storage
      localStorage.setItem("nagarsewa_user", JSON.stringify(currentUser));
    } else {
      // Remove user from storage when logged out
      localStorage.removeItem("nagarsewa_user");
    }
  }, [currentUser]);
  
  /**
   * Save disabled users list to localStorage whenever it changes.
   */
  useEffect(function() {
    localStorage.setItem("nagarsewa_disabled_users", JSON.stringify(disabledUsers));
  }, [disabledUsers]);
  
  
  // =========================================================================
  // AUTHENTICATION FUNCTIONS
  // =========================================================================
  
  /**
   * Log in a user with email and password.
   * 
   * This function checks:
   * 1. Is the account disabled?
   * 2. Is this the super admin?
   * 3. Is this a ward admin?
   * 4. Otherwise, treat as regular user
   * 
   * @param {string} email - User's email address
   * @param {string} password - User's password
   * @returns {Object} Result with success status and user/error info
   */
  function login(email, password) {
    // Step 1: Check if the user's account is disabled
    const isUserDisabled = disabledUsers.find(function(disabled) {
      return disabled.email.toLowerCase() === email.toLowerCase();
    });
    
    if (isUserDisabled) {
      return {
        success: false,
        error: "Your account has been disabled. Please contact the administrator.",
        isDisabled: true
      };
    }
    
    // Step 2: Check if this is the super admin
    const isSuperAdminLogin = (
      email.toLowerCase() === superAdminCredentials.email &&
      password === superAdminCredentials.password
    );
    
    if (isSuperAdminLogin) {
      const user = {
        id: "super-admin",
        email: superAdminCredentials.email,
        fullName: superAdminCredentials.fullName,
        role: ROLES.SUPER_ADMIN,
        jurisdiction: {
          district: "Jhapa",
          municipality: "Damak",
          wardNumber: null  // Super admin can access all wards
        }
      };
      
      setCurrentUser(user);
      return { success: true, user: user, redirectTo: "/admin" };
    }
    
    // Step 3: Check if this is a ward admin
    const wardAdmin = wardAdmins.find(function(admin) {
      return admin.email.toLowerCase() === email.toLowerCase() && admin.isActive;
    });
    
    if (wardAdmin) {
      const user = {
        id: wardAdmin.id,
        email: wardAdmin.email,
        fullName: wardAdmin.fullName,
        role: ROLES.WARD_ADMIN,
        wardNumber: wardAdmin.wardNumber,
        jurisdiction: {
          district: "Jhapa",
          municipality: "Damak",
          wardNumber: wardAdmin.wardNumber
        }
      };
      
      setCurrentUser(user);
      return { success: true, user: user, redirectTo: "/admin" };
    }

    // Step 4: Treat as regular user
    // In a real app, you would verify the password with the backend here
    const user = {
      id: `user-${Date.now()}`,
      email: email,
      fullName: email.split("@")[0],  // Use part before @ as name
      role: ROLES.USER,
      kycVerified: false,  // New users need to verify their identity
      jurisdiction: {
        district: "Jhapa",
        municipality: "Damak",
        wardNumber: null  // Will be set from signup data
      }
    };
    
    setCurrentUser(user);
    return { success: true, user: user, redirectTo: "/user" };
  }
  
  /**
   * Log out the current user.
   * Clears the user from state and removes from localStorage.
   */
  function logout() {
    setCurrentUser(null);
    localStorage.removeItem("nagarsewa_user");
  }
  
  
  // =========================================================================
  // ROLE CHECKING FUNCTIONS
  // =========================================================================
  
  /**
   * Check if the current user is a super admin.
   * @returns {boolean} true if super admin, false otherwise
   */
  function isSuperAdmin() {
    return currentUser?.role === ROLES.SUPER_ADMIN;
  }
  
  /**
   * Check if the current user is a ward admin.
   * @returns {boolean} true if ward admin, false otherwise
   */
  function isWardAdmin() {
    return currentUser?.role === ROLES.WARD_ADMIN;
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
   * Create a new ward admin account.
   * Only super admin can do this.
   * 
   * @param {Object} adminData - The new admin's information
   * @returns {Object} Success/failure result
   */
  function createWardAdmin(adminData) {
    // Only super admin can create ward admins
    if (!isSuperAdmin()) {
      return { success: false, error: "Only super admin can create ward admins" };
    }
    
    // Check if this ward already has an active admin
    const existingAdmin = wardAdmins.find(function(admin) {
      return admin.wardNumber === adminData.wardNumber && admin.isActive;
    });
    
    if (existingAdmin) {
      return {
        success: false,
        error: `Ward ${adminData.wardNumber} already has an active admin`
      };
    }
    
    // Check if email is already registered
    const emailExists = wardAdmins.find(function(admin) {
      return admin.email.toLowerCase() === adminData.email.toLowerCase();
    });
    
    if (emailExists) {
      return { success: false, error: "Email already registered" };
    }
    
    // Create the new admin
    const newAdmin = {
      id: `admin-${Date.now()}`,
      email: adminData.email,
      fullName: adminData.fullName,
      role: ROLES.WARD_ADMIN,
      wardNumber: adminData.wardNumber,
      phone: adminData.phone || "",
      isActive: true,
      createdAt: new Date().toISOString().split("T")[0]
    };
    
    // Add to the list
    setWardAdmins([...wardAdmins, newAdmin]);
    return { success: true, admin: newAdmin };
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
    
    const updatedAdmins = wardAdmins.map(function(admin) {
      if (admin.id === adminId) {
        return { ...admin, ...updates };
      }
      return admin;
    });
    
    setWardAdmins(updatedAdmins);
    return { success: true };
  }
  
  /**
   * Deactivate a ward admin account.
   * Only super admin can do this.
   * 
   * @param {string} adminId - The admin's ID
   * @returns {Object} Success/failure result
   */
  function deactivateWardAdmin(adminId) {
    if (!isSuperAdmin()) {
      return { success: false, error: "Only super admin can deactivate ward admins" };
    }

    // Update the admin's status to inactive
    const updatedAdmins = wardAdmins.map(function(admin) {
      if (admin.id === adminId) {
        return { ...admin, isActive: false };
      }
      return admin;
    });
    
    setWardAdmins(updatedAdmins);
    return { success: true };
  }
  
  /**
   * Reactivate a deactivated ward admin.
   * Only super admin can do this.
   * 
   * @param {string} adminId - The admin's ID
   * @returns {Object} Success/failure result
   */
  function reactivateWardAdmin(adminId) {
    if (!isSuperAdmin()) {
      return { success: false, error: "Only super admin can reactivate ward admins" };
    }
    
    // Find the admin to reactivate
    const admin = wardAdmins.find(function(a) {
      return a.id === adminId;
    });
    
    if (admin) {
      // Check if their ward already has an active admin
      const activeAdminForWard = wardAdmins.find(function(a) {
        return a.wardNumber === admin.wardNumber && a.isActive && a.id !== adminId;
      });
      
      if (activeAdminForWard) {
        return {
          success: false,
          error: `Ward ${admin.wardNumber} already has an active admin`
        };
      }
    }
    
    // Reactivate the admin
    const updatedAdmins = wardAdmins.map(function(admin) {
      if (admin.id === adminId) {
        return { ...admin, isActive: true };
      }
      return admin;
    });
    
    setWardAdmins(updatedAdmins);
    return { success: true };
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
    const assignedWards = wardAdmins
      .filter(function(admin) {
        return admin.isActive;
      })
      .map(function(admin) {
        return admin.wardNumber;
      });
    
    // Generate list of all wards (1 to 10)
    const allWards = [];
    for (let i = 1; i <= DAMAK_TOTAL_WARDS; i++) {
      allWards.push(i);
    }
    
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
