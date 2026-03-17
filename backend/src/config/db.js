const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

pool.on('connect', () => {
  console.log('PostgreSQL Connection Pool established');
});

pool.on('error', (err) => {
  console.error('DB ERROR:', err);
  // Do not exit onidle error, let it reconnect
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool
};
