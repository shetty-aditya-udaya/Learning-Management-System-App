const AuthService = require('../services/auth.service');

class AuthController {
  static async register(req, res) {
    try {
      const { email, password, role } = req.body;
      const user = await AuthService.register(email, password, role);
      res.status(201).json({ message: 'User registered successfully', userId: user.id });
    } catch (error) {
      if (error.message === 'User already exists') {
        return res.status(409).json({ message: error.message });
      }
      res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  }

  static async login(req, res) {
    try {
      const { email, password } = req.body;
      const { accessToken, refreshToken, user } = await AuthService.login(email, password);

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 15 * 60 * 1000, // 15 mins
      });

      res.status(200).json({ accessToken, user });
    } catch (error) {
      res.status(401).json({ message: error.message || 'Invalid credentials' });
    }
  }

  static async refresh(req, res) {
    try {
      const refreshToken = req.cookies.refreshToken;
      if (!refreshToken) {
        return res.status(401).json({ message: 'Refresh token not found' });
      }

      const accessToken = await AuthService.refresh(refreshToken);
      
      res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 15 * 60 * 1000, // 15 mins
      });

      res.status(200).json({ accessToken });
    } catch (error) {
      res.status(401).json({ message: 'Invalid refresh token' });
    }
  }

  static async logout(req, res) {
    try {
      const refreshToken = req.cookies.refreshToken;
      if (refreshToken) {
        await AuthService.logout(refreshToken);
      }
      res.clearCookie('refreshToken');
      res.status(200).json({ message: 'Logged out successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Error during logout' });
    }
  }
}

module.exports = AuthController;
