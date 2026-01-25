import { useState, useEffect } from "react";
import { AuthContext, DAMAK_TOTAL_WARDS, ROLES, mockWardAdmins, superAdminCredentials } from "./authConstants";

export const AuthProvider = ({ children }) => {
  // Initialize from localStorage
  const [currentUser, setCurrentUser] = useState(() => {
    const savedUser = localStorage.getItem("nagarsewa_user");
    if (savedUser) {
      try {
        return JSON.parse(savedUser);
      } catch {
        localStorage.removeItem("nagarsewa_user");
        return null;
      }
    }
    return null;
  });
  const [wardAdmins, setWardAdmins] = useState(mockWardAdmins);
  const [isLoading] = useState(false);

  // Save user to localStorage whenever it changes
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem("nagarsewa_user", JSON.stringify(currentUser));
    } else {
      localStorage.removeItem("nagarsewa_user");
    }
  }, [currentUser]);

  // Login function
  const login = (email, password) => {
    // Check if super admin
    if (
      email.toLowerCase() === superAdminCredentials.email &&
      password === superAdminCredentials.password
    ) {
      const user = {
        id: "super-admin",
        email: superAdminCredentials.email,
        fullName: superAdminCredentials.fullName,
        role: ROLES.SUPER_ADMIN,
        jurisdiction: {
          district: "Jhapa",
          municipality: "Damak",
          wardNumber: null, // Super admin has access to all wards
        },
      };
      setCurrentUser(user);
      return { success: true, user, redirectTo: "/admin" };
    }

    // Check if ward admin
    const wardAdmin = wardAdmins.find(
      (admin) => admin.email.toLowerCase() === email.toLowerCase() && admin.isActive
    );
    if (wardAdmin) {
      // In real app, you'd verify password here
      const user = {
        id: wardAdmin.id,
        email: wardAdmin.email,
        fullName: wardAdmin.fullName,
        role: ROLES.WARD_ADMIN,
        wardNumber: wardAdmin.wardNumber,
        jurisdiction: {
          district: "Jhapa",
          municipality: "Damak",
          wardNumber: wardAdmin.wardNumber,
        },
      };
      setCurrentUser(user);
      return { success: true, user, redirectTo: "/admin" };
    }

    // Regular user login (for demo, any email/password works)
    const user = {
      id: `user-${Date.now()}`,
      email: email,
      fullName: email.split("@")[0],
      role: ROLES.USER,
      jurisdiction: {
        district: "Jhapa",
        municipality: "Damak",
        wardNumber: null, // Will be set from signup data
      },
    };
    setCurrentUser(user);
    return { success: true, user, redirectTo: "/user" };
  };

  // Logout function
  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem("nagarsewa_user");
  };

  // Check if user is super admin
  const isSuperAdmin = () => {
    return currentUser?.role === ROLES.SUPER_ADMIN;
  };

  // Check if user is ward admin
  const isWardAdmin = () => {
    return currentUser?.role === ROLES.WARD_ADMIN;
  };

  // Check if user is regular user
  const isUser = () => {
    return currentUser?.role === ROLES.USER;
  };

  // Get user's ward number (for ward admins)
  const getUserWard = () => {
    return currentUser?.wardNumber || null;
  };

  // --- Super Admin Functions ---

  // Create a new ward admin (only super admin can do this)
  const createWardAdmin = (adminData) => {
    if (!isSuperAdmin()) {
      return { success: false, error: "Only super admin can create ward admins" };
    }

    // Check if ward already has an admin
    const existingAdmin = wardAdmins.find(
      (admin) => admin.wardNumber === adminData.wardNumber && admin.isActive
    );
    if (existingAdmin) {
      return {
        success: false,
        error: `Ward ${adminData.wardNumber} already has an active admin`,
      };
    }

    // Check if email already exists
    const emailExists = wardAdmins.find(
      (admin) => admin.email.toLowerCase() === adminData.email.toLowerCase()
    );
    if (emailExists) {
      return { success: false, error: "Email already registered" };
    }

    const newAdmin = {
      id: `admin-${Date.now()}`,
      email: adminData.email,
      fullName: adminData.fullName,
      role: ROLES.WARD_ADMIN,
      wardNumber: adminData.wardNumber,
      phone: adminData.phone || "",
      isActive: true,
      createdAt: new Date().toISOString().split("T")[0],
    };

    setWardAdmins([...wardAdmins, newAdmin]);
    return { success: true, admin: newAdmin };
  };

  // Update ward admin (only super admin)
  const updateWardAdmin = (adminId, updates) => {
    if (!isSuperAdmin()) {
      return { success: false, error: "Only super admin can update ward admins" };
    }

    setWardAdmins(
      wardAdmins.map((admin) =>
        admin.id === adminId ? { ...admin, ...updates } : admin
      )
    );
    return { success: true };
  };

  // Deactivate ward admin (only super admin)
  const deactivateWardAdmin = (adminId) => {
    if (!isSuperAdmin()) {
      return { success: false, error: "Only super admin can deactivate ward admins" };
    }

    setWardAdmins(
      wardAdmins.map((admin) =>
        admin.id === adminId ? { ...admin, isActive: false } : admin
      )
    );
    return { success: true };
  };

  // Reactivate ward admin (only super admin)
  const reactivateWardAdmin = (adminId) => {
    if (!isSuperAdmin()) {
      return { success: false, error: "Only super admin can reactivate ward admins" };
    }

    const admin = wardAdmins.find((a) => a.id === adminId);
    if (admin) {
      // Check if ward already has an active admin
      const activeAdminForWard = wardAdmins.find(
        (a) => a.wardNumber === admin.wardNumber && a.isActive && a.id !== adminId
      );
      if (activeAdminForWard) {
        return {
          success: false,
          error: `Ward ${admin.wardNumber} already has an active admin`,
        };
      }
    }

    setWardAdmins(
      wardAdmins.map((admin) =>
        admin.id === adminId ? { ...admin, isActive: true } : admin
      )
    );
    return { success: true };
  };

  // Get all ward admins (only super admin)
  const getWardAdmins = () => {
    if (!isSuperAdmin()) {
      return [];
    }
    return wardAdmins;
  };

  // Get wards without admin (only super admin)
  const getWardsWithoutAdmin = () => {
    if (!isSuperAdmin()) {
      return [];
    }
    const assignedWards = wardAdmins
      .filter((admin) => admin.isActive)
      .map((admin) => admin.wardNumber);
    return Array.from({ length: DAMAK_TOTAL_WARDS }, (_, i) => i + 1).filter(
      (ward) => !assignedWards.includes(ward)
    );
  };

  // --- Data Filtering Functions ---

  // Filter data based on user role and ward
  const filterDataByJurisdiction = (data, wardField = "wardNumber") => {
    if (!currentUser) return [];

    if (isSuperAdmin()) {
      // Super admin sees all data
      return data;
    }

    if (isWardAdmin()) {
      // Ward admin sees only their ward's data
      return data.filter((item) => item[wardField] === currentUser.wardNumber);
    }

    // Regular user sees only their data
    return data.filter((item) => item.userId === currentUser.id);
  };

  const value = {
    currentUser,
    isLoading,
    login,
    logout,
    isSuperAdmin,
    isWardAdmin,
    isUser,
    getUserWard,
    // Super admin functions
    createWardAdmin,
    updateWardAdmin,
    deactivateWardAdmin,
    reactivateWardAdmin,
    getWardAdmins,
    getWardsWithoutAdmin,
    // Data filtering
    filterDataByJurisdiction,
    // Constants
    ROLES,
    DAMAK_TOTAL_WARDS,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
