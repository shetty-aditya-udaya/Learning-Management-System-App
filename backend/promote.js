require('dotenv').config();
const { query } = require('./src/config/db');

async function promote() {
  try {
    const email = 'verify@success.com';
    const result = await query("UPDATE users SET role = 'instructor' WHERE email = $1 RETURNING *", [email]);
    if (result.rows.length > 0) {
      console.log('Successfully promoted:', result.rows[0].email, 'to role:', result.rows[0].role);
    } else {
      console.log('User not found:', email);
    }
  } catch (err) {
    console.error('Promotion failed:', err);
  } finally {
    process.exit();
  }
}

promote();
