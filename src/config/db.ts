import "reflect-metadata";
import { DataSource } from "typeorm";
import dotenv from "dotenv";

dotenv.config();

export const AppDataSource = new DataSource({
  type: "postgres",

  url: process.env.DB_CONNECTION_STRING,

  ssl: {
    rejectUnauthorized: false, // 🔥 REQUIRED for Neon
  },

  synchronize: true, // ⚠️ only for development
  logging: true,

  entities: [__dirname + "/../entities/*.ts"],
  migrations: [],
  subscribers: [],
});
