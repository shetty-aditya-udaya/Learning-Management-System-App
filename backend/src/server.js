const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();
const { query } = require('./config/db');

const authRoutes = require('./routes/auth.routes');
const courseRoutes = require('./routes/course.routes');
const progressRoutes = require('./routes/progress.routes');

const app = express();
const PORT = process.env.PORT || 8000;

// CORS configuration with diagnostic logging
const allowedOrigin = process.env.CLIENT_URL || 'http://localhost:3000';

console.log(`[CORS-SETUP] Configured allowed origin: ${allowedOrigin}`);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      console.log(`[CORS-DEBUG] Request with no origin allowed`);
      return callback(null, true);
    }
    
    if (origin === allowedOrigin || origin === 'http://localhost:3000') {
      return callback(null, true);
    } else {
      console.warn(`[CORS-WARN] Origin mismatch! Request from: ${origin}, Allowed: ${allowedOrigin}`);
      // Strictly allow only the configured origin in production
      if (process.env.NODE_ENV === 'production') {
        return callback(new Error('Not allowed by CORS'), false);
      }
      // In dev, allow but warn
      return callback(null, true);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  exposedHeaders: ['Set-Cookie']
}));

app.use(express.json());
app.use(cookieParser());

// Routing
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/progress', progressRoutes);

// DB Health Check Endpoint
app.get('/api/health/db', async (req, res) => {
  try {
    const result = await query('SELECT NOW() as current_time');
    res.status(200).json({
      status: 'success',
      message: 'Database connected successfully',
      timestamp: result.rows[0].current_time
    });
  } catch (err) {
    console.error('Database connection error in health check', err);
    res.status(500).json({
      status: 'error',
      message: 'Failed to connect to database',
      error: err.message
    });
  }
});

app.get('/', (req, res) => {
  res.send('LMS PostgreSQL Backend is Running');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
