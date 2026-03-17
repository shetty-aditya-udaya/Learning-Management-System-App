import "reflect-metadata";
import { DataSource } from "typeorm";
import dotenv from "dotenv";

dotenv.config();

export const AppDataSource = new DataSource({
  type: "mysql",
  url: process.env.DB_URL || "mysql://user:password@localhost:3306/lms_db",
  synchronize: true, // Auto-create tables for development
  logging: process.env.NODE_ENV !== "production",
  entities: ["src/entities/**/*.ts"],
  migrations: ["src/migrations/**/*.ts"],
  subscribers: [],
});
