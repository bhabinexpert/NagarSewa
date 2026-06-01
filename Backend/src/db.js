// Database connection using Pool for better connection management
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config({ quiet: true });

const { Pool } = pg;

// Create connection pool.
// - If DATABASE_URL is set (e.g. Render/Neon in production), use it over SSL.
// - Otherwise fall back to the individual PG_* vars (typical local Postgres,
//   which usually doesn't support SSL).
const connectionString = process.env.DATABASE_URL;

/**
 * Build the pool config for a hosted connection string.
 * We strip the `sslmode`/`channel_binding` query params and configure SSL
 * explicitly via the `ssl` option. This keeps the connection encrypted while
 * avoiding the driver's deprecated-`sslmode` security warning.
 */
function buildHostedConfig(rawUrl) {
  let cleanUrl = rawUrl;
  try {
    const url = new URL(rawUrl);
    url.searchParams.delete('sslmode');
    url.searchParams.delete('channel_binding');
    cleanUrl = url.toString();
  } catch {
    // Not a parseable URL — use the raw value as-is.
  }
  return { connectionString: cleanUrl, ssl: { rejectUnauthorized: false } };
}

const pool = connectionString
  ? new Pool(buildHostedConfig(connectionString))
  : new Pool({
      user: process.env.PG_USER,
      host: process.env.PG_HOST,
      database: process.env.PG_DATABASE,
      password: process.env.PG_PASSWORD,
      port: process.env.PG_PORT || 5432,
      ssl: process.env.PG_SSL === 'true' ? { rejectUnauthorized: false } : false,
    });

// Test database connection
export async function testConnection() {
  try {
    const client = await pool.connect();
    await client.query('SELECT NOW()');
    client.release();
    console.log('✅ Database connected successfully');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
}

// Query wrapper
export async function query(text, params) {
  try {
    const result = await pool.query(text, params);
    return result;
  } catch (error) {
    console.error('Query error:', error);
    throw error;
  }
}

export default pool;