require('dotenv').config();
const { query } = require('./src/config/db');

async function fix() {
  try {
    // 1. Check if column exists
    const check = await query("SELECT column_name FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'name'");
    if (check.rows.length === 0) {
      console.log('Column "name" missing. Adding it...');
      await query('ALTER TABLE users ADD COLUMN name VARCHAR(255)');
    } else {
      console.log('Column "name" already exists.');
    }

    // 2. Set the instructor name
    await query("UPDATE users SET name = 'Aditya Shetty' WHERE email = 'verify@success.com'");
    
    // 3. Verify total subjects
    const subjects = await query('SELECT id, title, instructor_id FROM subjects');
    console.log('Subjects count:', subjects.rows.length);
    console.log('Subjects:', JSON.stringify(subjects.rows, null, 2));

    process.exit(0);
  } catch (err) {
    console.error('Fix failed:', err);
    process.exit(1);
  }
}

fix();
