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
    rejectUnauthorized: false, // Required for Neon
  },
  synchronize: true, // Auto-create tables in development
  logging: false,
  entities: [Admin, Teacher, Attendance],
});

// import "reflect-metadata";
// import { DataSource } from "typeorm";
// import dotenv from "dotenv";
// import { Admin } from "../entities/Admin";
// import { Teacher } from "../entities/teachers";
// import { Attendance } from "../entities/attendance";

// dotenv.config();

// export const AppDataSource = new DataSource({
//   type: "postgres",
//   host: process.env.DB_HOST, // localhost
//   port: Number(process.env.DB_PORT), // 5432
//   username: process.env.DB_USERNAME,
//   password: process.env.DB_PASSWORD,
//   database: process.env.DB_NAME,
//   // ssl: false, // no SSL for localhost
//   synchronize: true, // auto-create tables in dev
//   logging: false,
//   entities: [Admin, Teacher, Attendance],
// });