/**
 * =============================================================================
 * SERVER.JS - Main Entry Point for the Backend
 * =============================================================================
 * 
 * This is where the backend server starts.
 * 
 * WHAT THIS FILE DOES:
 * 1. Sets up the Express.js server
 * 2. Connects to the PostgreSQL database
 * 3. Configures middleware (CORS, JSON parsing)
 * 4. Sets up API routes
 * 5. Starts listening for requests
 * 
 * HOW TO RUN:
 *   npm run dev   (for development)
 *   npm start     (for production)
 */

import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import db from './db.js';
import userRoute from './routes/userRoute.js';
import campaignsRoute from './routes/campaigns.js';


// -----------------------------------------------------------------------------
// LOAD ENVIRONMENT VARIABLES
// -----------------------------------------------------------------------------

/**
 * Load settings from .env file
 * This includes database credentials, JWT secret, port number, etc.
 */
dotenv.config();


// -----------------------------------------------------------------------------
// CREATE EXPRESS APP
// -----------------------------------------------------------------------------

/**
 * Create a new Express application.
 * Express is a web framework that makes it easy to create HTTP servers.
 */
const app = express();


// -----------------------------------------------------------------------------
// MIDDLEWARE SETUP
// -----------------------------------------------------------------------------

/**
 * Enable CORS (Cross-Origin Resource Sharing)
 * This allows the frontend (running on a different port) to make requests to this server.
 */
app.use(cors());

/**
 * Parse JSON request bodies
 * This lets us access req.body as a JavaScript object when clients send JSON data.
 */
app.use(express.json());


// -----------------------------------------------------------------------------
// ROUTES
// -----------------------------------------------------------------------------

/**
 * Health check route
 * Visit http://localhost:PORT/ to check if server is running
 */
app.get('/', function(req, res) {
  res.send("Server is running!");
});

/**
 * Authentication routes
 * All routes starting with /api/auth will be handled by userRoute
 * Examples: /api/auth/register, /api/auth/login
 */
app.use('/api/auth', userRoute);

/**
 * Campaign routes
 * All routes starting with /api/campaigns will be handled by campaignsRoute
 * Examples: /api/campaigns, /api/campaigns/:id/status
 */
app.use('/api/campaigns', campaignsRoute);


// -----------------------------------------------------------------------------
// START SERVER
// -----------------------------------------------------------------------------

/**
 * The port number to listen on.
 * Set this in your .env file (e.g., PORT=5000)
 */
const PORT = process.env.PORT;

/**
 * Start the server.
 * First connects to database, then starts listening for HTTP requests.
 */
async function startServer() {
  try {
    // Step 1: Connect to the PostgreSQL database
    await db.connect();
    console.log('✅ Database connection successful');

    // Step 2: Start the HTTP server
    app.listen(PORT, function() {
      console.log(`🚀 Server is running at http://localhost:${PORT}`);
    });

  } catch (error) {
    // If anything fails, log the error and exit
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Run the startup function
startServer();

