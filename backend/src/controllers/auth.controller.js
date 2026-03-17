const AuthService = require('../services/auth.service');

class AuthController {
  static async register(req, res) {
    try {
      const { email, password, role } = req.body;
      const user = await AuthService.register(email, password, role);
      res.status(201).json({ 
        success: true,
        message: 'User registered successfully', 
        userId: user.id 
      });
    } catch (error) {
      console.error(`[CONTROLLER-REGISTER] Error: ${error.message}`);
      if (error.message === 'User already exists') {
        return res.status(409).json({ success: false, message: error.message });
      }
      res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
    }
  }

  static async login(req, res) {
    try {
      const { email, password } = req.body;
      const { accessToken, refreshToken, user } = await AuthService.login(email, password);

      const isProd = process.env.NODE_ENV === 'production';
      
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? 'none' : 'strict', // None for cross-domain prod if needed
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? 'none' : 'strict',
        maxAge: 15 * 60 * 1000, // 15 mins
      });

      res.status(200).json({ 
        success: true,
        message: 'Login successful',
        accessToken, 
        user 
      });
    } catch (error) {
      console.error(`[CONTROLLER-LOGIN] Error: ${error.message}`);
      // Standardize 401 for any auth failure
      const status = error.message.includes('Invalid') ? 401 : 500;
      res.status(status).json({ success: false, message: error.message || 'Authentication failed' });
    }
  }

  static async refresh(req, res) {
    try {
      const refreshToken = req.cookies.refreshToken;
      if (!refreshToken) {
        return res.status(401).json({ success: false, message: 'Refresh token not found' });
      }

      const accessToken = await AuthService.refresh(refreshToken);
      
      const isProd = process.env.NODE_ENV === 'production';
      res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? 'none' : 'strict',
        maxAge: 15 * 60 * 1000, // 15 mins
      });

      res.status(200).json({ success: true, accessToken });
    } catch (error) {
      console.error(`[CONTROLLER-REFRESH] Error: ${error.message}`);
      res.status(401).json({ success: false, message: 'Invalid or expired refresh token' });
    }
  }

  static async logout(req, res) {
    try {
      const refreshToken = req.cookies.refreshToken;
      if (refreshToken) {
        await AuthService.logout(refreshToken);
      }
      res.clearCookie('refreshToken');
      res.clearCookie('accessToken');
      res.status(200).json({ success: true, message: 'Logged out successfully' });
    } catch (error) {
      console.error(`[CONTROLLER-LOGOUT] Error: ${error.message}`);
      res.status(500).json({ success: false, message: 'Error during logout' });
    }
  }
}

module.exports = AuthController;
