// Server entry point
import dotenv from 'dotenv';
import app from './app.js';
import { testConnection } from './db.js';

dotenv.config({ quiet: true });

const PORT = process.env.PORT || 2026;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Start server
async function startServer() {
  try {
    // Test database connection
    await testConnection();
    console.log('✅ Database connected');

    // Start HTTP server
    app.listen(PORT, () => {
      console.log('🚀 Server started successfully');
      if (NODE_ENV === 'development') {
        console.log(`📍 Running at: http://localhost:${PORT}`);
      }
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
}

startServer();
