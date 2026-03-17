const AuthService = require('../services/auth.service');

class AuthController {
  static async register(req, res) {
    console.log("Incoming body:", req.body);
    try {
      const { email, password, role } = req.body;

      if (!email || !password) {
        return res.status(400).json({ success: false, message: "Email and password are required" });
      }

      const user = await AuthService.register(email, password, role);
      res.status(201).json({ 
        success: true,
        message: 'User registered successfully', 
        userId: user.id 
      });
    } catch (error) {
      console.error("AUTH ERROR:", error);
      if (error.message === 'User already exists') {
        return res.status(409).json({ success: false, message: error.message });
      }
      res.status(500).json({ success: false, message: error.message || 'Internal server error' });
    }
  }

  static async login(req, res) {
    console.log("Incoming body:", req.body);
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ success: false, message: "Email and password are required" });
      }

      const { accessToken, refreshToken, user } = await AuthService.login(email, password);

      const isProd = process.env.NODE_ENV === 'production';
      
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? 'none' : 'strict',
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
      console.error("AUTH ERROR:", error);
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
      console.error("AUTH ERROR (REFRESH):", error);
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
      console.error("AUTH ERROR (LOGOUT):", error);
      res.status(500).json({ success: false, message: 'Error during logout' });
    }
  }
}

module.exports = AuthController;
