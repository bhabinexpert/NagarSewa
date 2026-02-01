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
