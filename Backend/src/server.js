// Server entry point
import dotenv from 'dotenv';
import app from './app.js';
import { testConnection } from './db.js';

dotenv.config({ quiet: true });

const PORT = process.env.PORT || 2026;


// Start server
async function startServer() {
  try {
    // Test database connection
    const isConnected = await testConnection();
    if (!isConnected) {
      console.error('❌ Cannot start server without database connection');
      process.exit(1);
    }

    // Start HTTP server
    app.listen(PORT, () => {
      console.log('🚀 Server started successfully');
     
      console.log(`📍 Running at: http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
}

startServer();
