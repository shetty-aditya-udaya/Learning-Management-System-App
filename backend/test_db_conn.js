const { query } = require('./src/config/db');
require('dotenv').config();

async function testConnection() {
  try {
    console.log('--- DB CONNECTION TEST ---');
    const result = await query('SELECT NOW()');
    console.log('✔ SUCCESS: Connected to PostgreSQL at', result.rows[0].now);
    process.exit(0);
  } catch (err) {
    console.error('❌ FAILURE: Could not connect to DB');
    console.error('Error Details:', err.message);
    process.exit(1);
  }
}

testConnection();
