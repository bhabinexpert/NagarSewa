/**
 * =============================================================================
 * AUTHENTICATION CONSTANTS
 * =============================================================================
 * 
 * This file contains all the constant values used for authentication.
 * Constants are values that never change during the app's lifetime.
 * 
 * WHY USE CONSTANTS?
 * - Prevents typos (ROLES.SUPER_ADMIN vs "super_admin")
 * - Easy to update in one place
 * - Makes code more readable
 */

import { createContext } from "react";


// =============================================================================
// AUTH CONTEXT
// =============================================================================

/**
 * The Auth Context.
 * 
 * React Context is like a "global variable" that can be accessed
 * from any component without passing props down the tree.
 * 
 * This context will hold:
 * - The current logged-in user
 * - Login/logout functions
 * - Role checking functions
 */
export const AuthContext = createContext(null);


// =============================================================================
// MUNICIPALITY CONFIGURATION
// =============================================================================

/**
 * Total number of wards in Damak Municipality.
 * Damak has 10 wards, numbered 1 to 10.
 */
export const DAMAK_TOTAL_WARDS = 10;


// =============================================================================
// USER ROLES
// =============================================================================

/**
 * The different types of users in the system.
 * 
 * SUPER_ADMIN: The main administrator who manages everything
 *   - Can create/manage ward admins
 *   - Can see all wards' data
 *   - Can set issue priorities
 * 
 * WARD_ADMIN: Administrator for a specific ward
 *   - Can only see their ward's issues
 *   - Can update issue status
 *   - Can verify user KYC
 * 
 * USER: Regular citizen
 *   - Can report issues
 *   - Can view their own issues
 *   - Can update their profile
 */
export const ROLES = {
  SUPER_ADMIN: "super_admin",
  WARD_ADMIN: "ward_admin",
  USER: "user"
};


// =============================================================================
// MOCK DATA (For Development Only - Remove in Production)
// =============================================================================

/**
 * Sample ward admin accounts for testing.
 * 
 * In a real application, this data would come from the backend database.
 * This is only for demonstration purposes.
 */
export const mockWardAdmins = [
  {
    id: "admin-1",
    email: "ward1@damak.gov.np",
    fullName: "Ram Sharma",
    role: ROLES.WARD_ADMIN,
    wardNumber: 1,
    phone: "9800000001",
    isActive: true,
    createdAt: "2024-01-15"
  },
  {
    id: "admin-2",
    email: "ward2@damak.gov.np",
    fullName: "Sita Thapa",
    role: ROLES.WARD_ADMIN,
    wardNumber: 2,
    phone: "9800000002",
    isActive: true,
    createdAt: "2024-01-20"
  },
  {
    id: "admin-3",
    email: "ward5@damak.gov.np",
    fullName: "Hari Adhikari",
    role: ROLES.WARD_ADMIN,
    wardNumber: 5,
    phone: "9800000005",
    isActive: true,
    createdAt: "2024-02-01"
  }
];

/**
 * Super admin login credentials for testing.
 * 
 * WARNING: In a real application, NEVER store passwords in code!
 * This should be handled securely in the backend.
 */
export const superAdminCredentials = {
  email: "superadmin@damak.gov.np",
  password: "superadmin123",
  fullName: "Municipality Administrator",
  role: ROLES.SUPER_ADMIN
};
