const { query } = require('./src/config/db');
require('dotenv').config();

async function checkSchema() {
  try {
    console.log('--- Checking users table schema ---');
    const res = await query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'users'
    `);
    
    console.log('Columns:');
    res.rows.forEach(col => {
      console.log(`- ${col.column_name} (${col.data_type})`);
    });
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

checkSchema();
