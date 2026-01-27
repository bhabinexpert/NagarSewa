/**
 * =============================================================================
 * USER ROUTES - Authentication API Endpoints
 * =============================================================================
 * 
 * Routes define the URL endpoints and connect them to controllers.
 * 
 * WHAT IS A ROUTE?
 * A route is a URL pattern + HTTP method that the server responds to.
 * When a request matches a route, its controller function is called.
 * 
 * CURRENT ROUTES:
 * - POST /api/auth/register → Create a new user account
 * 
 * TODO: Add more routes:
 * - POST /api/auth/login → Log in a user
 * - POST /api/auth/logout → Log out a user
 * - GET /api/auth/me → Get current user info
 * - POST /api/auth/forgot-password → Request password reset
 * - POST /api/auth/reset-password → Reset password with token
 */

import express from 'express';
import { registerUser } from "../controllers/Authorization.controllers.js";


// -----------------------------------------------------------------------------
// CREATE ROUTER
// -----------------------------------------------------------------------------

/**
 * Create an Express router.
 * A router is like a mini-app that handles a group of related routes.
 */
const router = express.Router();


// -----------------------------------------------------------------------------
// DEFINE ROUTES
// -----------------------------------------------------------------------------

/**
 * POST /api/auth/register
 * 
 * Register a new user account.
 * 
 * Request body should include:
 *   - full_name: User's full name
 *   - email: Email address
 *   - password: Password (will be hashed)
 *   - phone: Phone number
 * 
 * Returns:
 *   - 201: Success with user data and JWT token
 *   - 400: Email already exists
 *   - 500: Server error
 */
router.post('/register', registerUser);


// TODO: Add login route
// router.post('/login', loginUser);

// TODO: Add logout route
// router.post('/logout', logoutUser);

// TODO: Add get current user route
// router.get('/me', authMiddleware, getCurrentUser);


// -----------------------------------------------------------------------------
// EXPORT ROUTER
// -----------------------------------------------------------------------------

/**
 * Export the router so it can be used in server.js
 * In server.js: app.use('/api/auth', userRoute)
 */
export default router;