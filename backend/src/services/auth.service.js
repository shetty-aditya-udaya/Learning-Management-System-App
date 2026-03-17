const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { query } = require('../config/db');

class AuthService {
  static async register(email, password, role = 'student') {
    console.log(`[AUTH-REGISTER] Attempting registration for: ${email}`);
    
    // Fetch all users to check duplicate (MANDATORY SELECT * for verification)
    const existingUser = await query('SELECT * FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      console.warn(`[AUTH-REGISTER] Registration failed: User ${email} already exists`);
      throw new Error('User already exists');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    console.log('[AUTH-REGISTER] Password hashed successfully. Inserting into DB...');
    const result = await query(
      'INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3) RETURNING id, email, role',
      [email, passwordHash, role]
    );

    console.log(`[AUTH-REGISTER] User ${email} created successfully with ID: ${result.rows[0].id}`);
    return result.rows[0];
  }

  static async login(email, password) {
    console.log(`[AUTH-LOGIN] Login attempt for: ${email}`);
    
    const result = await query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];

    if (!user) {
      console.warn(`[AUTH-LOGIN] Login failed: User ${email} not found in database`);
      throw new Error('Invalid email or password');
    }

    console.log(`[AUTH-LOGIN] User found. Found fields: ${Object.keys(user).join(', ')}`);
    
    // CRITICAL: Must use password_hash
    if (!user.password_hash) {
      console.error(`[AUTH-LOGIN] CRITICAL: DB user object missing 'password_hash' column!`);
      throw new Error('Authentication configuration error');
    }

    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    console.log(`[AUTH-LOGIN] Password comparison result: ${isValidPassword}`);
    
    if (!isValidPassword) {
      console.warn(`[AUTH-LOGIN] Login failed: Password mismatch for ${email}`);
      throw new Error('Invalid email or password');
    }

    const accessToken = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET || 'default_secret',
      { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_REFRESH_SECRET || 'default_refresh_secret',
      { expiresIn: '7d' }
    );

    // Store refresh token in DB
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    await query(
      'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
      [user.id, refreshToken, expiresAt]
    );

    console.log(`[AUTH-LOGIN] Login successful for: ${email}`);
    return { 
      accessToken, 
      refreshToken, 
      user: { id: user.id, email: user.email, role: user.role, name: user.name } 
    };
  }

  static async refresh(refreshToken) {
    console.log('[AUTH-REFRESH] Attempting token refresh...');
    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET || 'default_refresh_secret'
    );

    const tokenResult = await query(
      'SELECT * FROM refresh_tokens WHERE token = $1 AND user_id = $2 AND expires_at > NOW()',
      [refreshToken, decoded.userId]
    );

    if (tokenResult.rows.length === 0) {
      console.warn('[AUTH-REFRESH] Refresh failed: Invalid or expired token');
      throw new Error('Invalid or expired refresh token');
    }

    const userResult = await query('SELECT id, role FROM users WHERE id = $1', [decoded.userId]);
    const user = userResult.rows[0];

    if (!user) {
      console.warn('[AUTH-REFRESH] Refresh failed: User no longer exists');
      throw new Error('User not found');
    }

    return jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET || 'default_secret',
      { expiresIn: '15m' }
    );
  }

  static async logout(refreshToken) {
    console.log('[AUTH-LOGOUT] Deleting refresh token from DB');
    await query('DELETE FROM refresh_tokens WHERE token = $1', [refreshToken]);
  }
}

module.exports = AuthService;
