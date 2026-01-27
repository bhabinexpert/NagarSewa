/**
 * =============================================================================
 * useAuth HOOK - Easy Access to Authentication
 * =============================================================================
 * 
 * This is a custom hook that makes it easy to access authentication
 * information from any component in the app.
 * 
 * WHAT IS A HOOK?
 * A hook is a special function that lets you "hook into" React features.
 * Hooks always start with "use" (like useAuth, useState, useEffect).
 * 
 * HOW TO USE:
 * 
 *   import { useAuth } from '../context/useAuth';
 * 
 *   function MyComponent() {
 *     const { currentUser, login, logout, isSuperAdmin } = useAuth();
 *     
 *     if (!currentUser) {
 *       return <p>Please log in</p>;
 *     }
 *     
 *     return <p>Welcome, {currentUser.fullName}!</p>;
 *   }
 * 
 * WHAT YOU CAN ACCESS:
 * - currentUser: The logged-in user object (or null if not logged in)
 * - login(email, password): Function to log in
 * - logout(): Function to log out
 * - isSuperAdmin(): Check if user is super admin
 * - isWardAdmin(): Check if user is ward admin
 * - isUser(): Check if user is regular user
 * - And more... see AuthContext.jsx for full list
 */

import { useContext } from "react";
import { AuthContext } from "./authConstants";


/**
 * Custom hook to access authentication context.
 * 
 * @returns {Object} All auth functions and data
 * @throws {Error} If used outside of AuthProvider
 */
export function useAuth() {
  // Get the auth context value
  const context = useContext(AuthContext);
  
  // Make sure we're inside an AuthProvider
  if (!context) {
    throw new Error(
      "useAuth must be used inside an AuthProvider. " +
      "Make sure your component is wrapped with <AuthProvider>."
    );
  }
  
  return context;
}
