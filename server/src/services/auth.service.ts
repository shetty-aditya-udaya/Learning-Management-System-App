import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { AppDataSource } from "../config/database";
import { User, UserRole } from "../entities/User";

const userRepository = AppDataSource.getRepository(User);

export class AuthService {
  static async register(email: string, password: string, role: UserRole = UserRole.STUDENT) {
    const existingUser = await userRepository.findOneBy({ email });
    if (existingUser) {
      throw new Error("User already exists");
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const user = userRepository.create({ email, password_hash, role });
    await userRepository.save(user);

    return user;
  }

  static async login(email: string, password: string) {
    const user = await userRepository.findOneBy({ email });
    if (!user) {
      throw new Error("Invalid email or password");
    }

    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      throw new Error("Invalid email or password");
    }

    const accessToken = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET || "default_secret",
      { expiresIn: "15m" }
    );

    const refreshToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_REFRESH_SECRET || "default_refresh_secret",
      { expiresIn: "7d" }
    );

    return { accessToken, refreshToken, user };
  }

  static async refresh(refreshToken: string) {
     const decoded = jwt.verify(
        refreshToken, 
        process.env.JWT_REFRESH_SECRET || "default_refresh_secret"
     ) as { userId: string };

     const user = await userRepository.findOneBy({ id: decoded.userId });
     if (!user) throw new Error("User not found");

     return jwt.sign(
         { userId: user.id, role: user.role },
         process.env.JWT_SECRET || "default_secret",
         { expiresIn: "15m" }
     );
  }
}
