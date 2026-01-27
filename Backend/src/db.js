/**
 * =============================================================================
 * DATABASE CONNECTION - PostgreSQL Setup
 * =============================================================================
 * 
 * This file sets up the connection to our PostgreSQL database.
 * 
 * WHAT IS POSTGRESQL?
 * PostgreSQL (or "Postgres") is a powerful, open-source database system.
 * It stores all our data: users, issues, notifications, etc.
 * 
 * CONFIGURATION:
 * Database settings are stored in the .env file:
 *   - PG_USER: Database username
 *   - PG_HOST: Database server address (usually 'localhost')
 *   - PG_DATABASE: Name of the database
 *   - PG_PASSWORD: Database password
 *   - PG_PORT: Port number (usually 5432)
 * 
 * HOW TO USE:
 *   import db, { query } from './db.js';
 *   
 *   // Run a SQL query
 *   const result = await query('SELECT * FROM users WHERE id = $1', [userId]);
 */

import pg from 'pg';
import dotenv from 'dotenv';


// Load environment variables from .env file
dotenv.config();


// -----------------------------------------------------------------------------
// CREATE DATABASE CLIENT
// -----------------------------------------------------------------------------

/**
 * Create a new PostgreSQL client.
 * This client will maintain a connection to the database.
 * 
 * We use environment variables for security - never hardcode passwords!
 */
const db = new pg.Client({
  user: process.env.PG_USER,         // Database username
  host: process.env.PG_HOST,         // Database server address
  database: process.env.PG_DATABASE, // Database name
  password: process.env.PG_PASSWORD, // Database password
  port: process.env.PG_PORT          // Database port (usually 5432)
});


// -----------------------------------------------------------------------------
// ERROR HANDLING
// -----------------------------------------------------------------------------

/**
 * Handle unexpected database errors.
 * If the connection drops or an error occurs, log it and exit.
 */
db.on('error', function(err) {
  console.error("❌ Database error:", err);
  process.exit(-1);
});


// -----------------------------------------------------------------------------
// QUERY HELPER FUNCTION
// -----------------------------------------------------------------------------

/**
 * Execute a SQL query on the database.
 * 
 * @param {string} text - The SQL query string (use $1, $2, etc. for parameters)
 * @param {Array} params - Array of values to substitute for $1, $2, etc.
 * @returns {Promise} Query result
 * 
 * EXAMPLES:
 * 
 *   // Get all users
 *   const result = await query('SELECT * FROM users');
 *   
 *   // Get user by email (use $1 to prevent SQL injection)
 *   const result = await query('SELECT * FROM users WHERE email = $1', ['test@example.com']);
 *   
 *   // Insert a new user
 *   const result = await query(
 *     'INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *',
 *     ['Ram', 'ram@example.com']
 *   );
 */
export function query(text, params) {
  return db.query(text, params);
}


// -----------------------------------------------------------------------------
// EXPORT
// -----------------------------------------------------------------------------

/**
 * Export the database client as default.
 * This is used in server.js to connect: await db.connect()
 */
export default db;