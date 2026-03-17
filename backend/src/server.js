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

console.log("CLIENT_URL:", process.env.CLIENT_URL);

const allowedOrigins = [
  process.env.CLIENT_URL,
  "http://localhost:3000"
];

app.use(cors({
  origin: function(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`[CORS-WARN] Not allowed by CORS: ${origin}`);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
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
