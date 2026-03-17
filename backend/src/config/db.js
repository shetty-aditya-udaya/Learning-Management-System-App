const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: 24154,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: "defaultdb",
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
