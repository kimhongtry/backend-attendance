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
// import "reflect-metadata";
// import { DataSource } from "typeorm";
// import dotenv from "dotenv";
// import { Admin } from "../entities/Admin";
// import { Teacher } from "../entities/teachers";
// import { Attendance } from "../entities/attendance";

// dotenv.config();

// export const AppDataSource = new DataSource({
//   type: "postgres",
//   host: process.env.DB_HOST,
//   port: Number(process.env.DB_PORT),
//   username: process.env.DB_USERNAME,
//   password: process.env.DB_PASSWORD,
//   database: process.env.DB_NAME,
//   // ✅ No ssl needed for local postgres
//   synchronize: true,
//   logging: false,
//   ssl: false,

//   entities: [Admin, Teacher, Attendance],
// });
