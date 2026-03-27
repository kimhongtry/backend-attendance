import "reflect-metadata";
import { DataSource } from "typeorm";
import dotenv from "dotenv";
import { Admin } from "../entities/Admin";
import { Teacher } from "../entities/teachers";
import { Attendance } from "../entities/attendance";

dotenv.config();

export const AppDataSource = new DataSource({
  type: "postgres",
  url: process.env.DB_CONNECTION_STRING,
  ssl: {
    rejectUnauthorized: false,
  },
  synchronize: true, // Auto-creates tables in development
  logging: false,
  entities: [Admin, Teacher, Attendance],
});
