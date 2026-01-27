/**
 * =============================================================================
 * AUTHORIZATION CONTROLLERS - User Registration & Login Logic
 * =============================================================================
 * 
 * Controllers contain the business logic for handling API requests.
 * This file handles user authentication: registration and login.
 * 
 * WHAT IS A CONTROLLER?
 * A controller is a function that:
 * 1. Receives a request from the client
 * 2. Processes the data (validates, saves to database, etc.)
 * 3. Sends back a response
 * 
 * SECURITY NOTES:
 * - Passwords are hashed using bcrypt (never stored in plain text)
 * - Authentication uses JWT (JSON Web Tokens)
 */

import { query } from "../db.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";


// =============================================================================
// REGISTER NEW USER
// =============================================================================

/**
 * Register a new user account.
 * 
 * This function:
 * 1. Receives user data from the request body
 * 2. Checks if email already exists
 * 3. Hashes the password for security
 * 4. Saves the user to the database
 * 5. Returns a JWT token for immediate login
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * 
 * EXPECTED REQUEST BODY:
 * {
 *   full_name: "Ram Sharma",
 *   email: "ram@example.com",
 *   password: "securepassword",
 *   phone: "9800000000",
 *   role: "user",           // optional, defaults to "user"
 *   is_verified: false      // optional
 * }
 * 
 * SUCCESS RESPONSE (201):
 * {
 *   message: "User registered successfully",
 *   token: "jwt.token.here",
 *   user: { id, full_name, email, ... }
 * }
 * 
 * ERROR RESPONSES:
 * - 400: User already exists
 * - 500: Internal server error
 */
export async function registerUser(req, res) {
  try {
    // -----------------------------------------------------
    // STEP 1: Extract data from request body
    // -----------------------------------------------------
    const {
      full_name,
      email,
      password,
      phone,
      role,
      is_verified
    } = req.body;

    // -----------------------------------------------------
    // STEP 2: Check if user already exists
    // -----------------------------------------------------
    // Query the database to see if this email is already registered
    const existingUserQuery = await query(
      `SELECT * FROM users WHERE email = $1`,
      [email]
    );

    // If we found a user with this email, reject the registration
    if (existingUserQuery.rows.length > 0) {
      return res.status(400).json({
        message: "User already exists with this email."
      });
    }

    // -----------------------------------------------------
    // STEP 3: Hash the password
    // -----------------------------------------------------
    // We NEVER store plain text passwords!
    // bcrypt.hash() creates a secure, one-way hash
    // The "10" is the salt rounds (higher = more secure but slower)
    const hashedPassword = await bcrypt.hash(password, 10);

    // -----------------------------------------------------
    // STEP 4: Set default role if not provided
    // -----------------------------------------------------
    // If no role is specified, default to "user"
    const userRole = role || "user";

    // -----------------------------------------------------
    // STEP 5: Insert the new user into the database
    // -----------------------------------------------------
    const insertQuery = `
      INSERT INTO users(
        full_name, email, password, phone, role, is_verified
      )
      VALUES($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;

    const insertResult = await query(insertQuery, [
      full_name,
      email,
      hashedPassword,  // Save the hashed password, NOT the original
      phone,
      userRole,
      is_verified
    ]);

    // Get the newly created user from the database result
    const newUser = insertResult.rows[0];

    // -----------------------------------------------------
    // STEP 6: Generate a JWT token
    // -----------------------------------------------------
    // JWT tokens let the user stay logged in without re-entering password
    const token = jwt.sign(
      { id: newUser.id, role: newUser.role },  // Payload: data stored in token
      process.env.JWT_SECRET,                   // Secret key for signing
      { expiresIn: "24h" }                      // Token expires in 24 hours
    );

    // -----------------------------------------------------
    // STEP 7: Send success response
    // -----------------------------------------------------
    res.status(201).json({
      message: "User registered successfully",
      token: token,
      user: newUser
    });

  } catch (error) {
    // If anything goes wrong, log it and send an error response
    console.error("Error registering user:", error);
    res.status(500).json({
      message: "Internal server error"
    });
  }
}
