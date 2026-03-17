import { Request, Response } from "express";
import { AuthService } from "../services/auth.service";

export class AuthController {
  static async register(req: Request, res: Response) {
    try {
      const { email, password, role } = req.body;
      const user = await AuthService.register(email, password, role);
      res.status(201).json({ message: "User registered successfully", userId: user.id });
    } catch (error: any) {
      if (error.message === "User already exists") {
         res.status(409).json({ message: error.message });
         return;
      }
      res.status(500).json({ message: "Internal server error" });
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      const { accessToken, refreshToken, user } = await AuthService.login(email, password);
      
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.status(200).json({ accessToken, user: { id: user.id, email: user.email, role: user.role } });
    } catch (error: any) {
      res.status(401).json({ message: error.message || "Invalid credentials" });
    }
  }

  static async refresh(req: Request, res: Response) {
     try {
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) {
           res.status(401).json({ message: "Refresh token not found" });
           return;
        }

        const accessToken = await AuthService.refresh(refreshToken);
        res.status(200).json({ accessToken });
     } catch (error: any) {
        res.status(401).json({ message: "Invalid refresh token" });
     }
  }

  static logout(req: Request, res: Response) {
    res.clearCookie("refreshToken");
    res.status(200).json({ message: "Logged out successfully" });
  }
}
