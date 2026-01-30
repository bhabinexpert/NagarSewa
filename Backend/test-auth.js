/**
 * Test script to verify authentication system
 */

import dotenv from 'dotenv';
import pg from 'pg';

dotenv.config({ quiet: true });
const { Pool } = pg;

const pool = new Pool({
  host: process.env.PG_HOST,
  port: process.env.PG_PORT,
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  database: process.env.PG_DATABASE
});

async function testAuth() {
  console.log('🔍 Testing Authentication System\n');
  console.log('='.repeat(60));
  
  try {
    // Check admin users
    const result = await pool.query(`
      SELECT id, email, role, ward_number, is_disabled 
      FROM users 
      WHERE role IN ('super_admin', 'ward_admin')
      ORDER BY role DESC, ward_number
    `);
    
    console.log('\n📊 Current Admin Users:\n');
    if (result.rows.length === 0) {
      console.log('  No admin users found in database.');
    } else {
      result.rows.forEach(user => {
        const roleDisplay = user.role === 'super_admin' ? 'Super Admin' : 'Ward Admin';
        const wardDisplay = user.ward_number ? `Ward ${user.ward_number}` : 'All Wards';
        const statusDisplay = !user.is_disabled ? '✅ Active' : '❌ Inactive';
        
        console.log(`  ${roleDisplay.padEnd(15)} | ${wardDisplay.padEnd(10)} | ${user.email.padEnd(30)} | ${statusDisplay}`);
      });
    }
    
    // Check wards without admin
    const wardsResult = await pool.query(`
      SELECT generate_series(1, 10) AS ward_number
      EXCEPT
      SELECT ward_number FROM users WHERE role = 'ward_admin' AND (is_disabled IS NULL OR is_disabled = false)
      ORDER BY ward_number
    `);
    
    console.log('\n📍 Wards Without Active Admin:');
    if (wardsResult.rows.length === 0) {
      console.log('  All wards have active admins! ✅');
    } else {
      const wards = wardsResult.rows.map(r => r.ward_number).join(', ');
      console.log(`  Wards: ${wards}`);
    }
    
    // Check user count
    const userResult = await pool.query('SELECT COUNT(*) as count FROM users WHERE role = $1', ['user']);
    console.log(`\n👥 Total Regular Users: ${userResult.rows[0].count}`);
    
    console.log('\n' + '='.repeat(60));
    console.log('\n✅ Test completed successfully!\n');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

testAuth();
