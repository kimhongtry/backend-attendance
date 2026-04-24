// import "reflect-metadata";
// import { DataSource } from "typeorm";
// import dotenv from "dotenv";
// import { Admin } from "../entities/Admin";
// import { Teacher } from "../entities/teachers";
// import { Attendance } from "../entities/attendance";

// dotenv.config();

// export const AppDataSource = new DataSource({
//   type: "postgres",
//   url: process.env.DB_CONNECTION_STRING,
//   ssl: {
//     rejectUnauthorized: false, // Required for Neon
//   },
//   synchronize: true, // Auto-create tables in development
//   logging: false,
//   entities: [Admin, Teacher, Attendance],
// });

// import "reflect-metadata";
// import dotenv from "dotenv";
// dotenv.config();

// import { DataSource } from "typeorm";

// if (!process.env.DB_PASSWORD) {
//   throw new Error("❌ DB_PASSWORD is missing in .env");
// }

// export const AppDataSource = new DataSource({
//   type: "postgres",
//   host: process.env.DB_HOST,
//   port: Number(process.env.DB_PORT),
//   username: process.env.DB_USERNAME,
//   password: process.env.DB_PASSWORD,
//   database: process.env.DB_NAME,

//   synchronize: true,
//   logging: false,
//   ssl: false,
// });


import { DataSource } from "typeorm";
import { PostgresConnectionOptions } from "typeorm/driver/postgres/PostgresConnectionOptions";
import { Admin } from "../entities/Admin";
import { Teacher } from "../entities/teachers";
import { Attendance } from "../entities/attendance";


// import dotenv from "dotenv";
// dotenv.config(); // This MUST be at the very top!


const dbConfig: PostgresConnectionOptions = {
  type: "postgres",
  host: process.env.DB_HOST || "db", // 👈 THIS was missing!
  port: Number(process.env.DB_PORT) || 5432,
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  synchronize: true,
  logging: true,
  entities: [Admin, Teacher, Attendance],
  ssl: false,
};

export const AppDataSource = new DataSource(dbConfig);