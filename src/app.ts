import express, { Application } from "express";
import cors from "cors";
import path from "path";

// Route Imports
import authRoutes from "./routes/authRoute";
import teacherRoutes from "./routes/teacherRoute";
import attendanceRoutes from "./routes/attendentRoute";
import dashboardRoute from "./routes/dashboardRoute";

const app: Application = express();

// 1. GLOBAL MIDDLEWARE
// origin: "*" allows your frontend on Render to talk to this backend easily.
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// Body parser
app.use(express.json());

// 2. STATIC FILES
// This ensures that teacher profile photos in the /uploads folder are accessible
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// 3. API ROUTES
app.use("/api/auth", authRoutes);
app.use("/api/teachers", teacherRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/dashboard", dashboardRoute);

// 4. ROOT HEALTH CHECK
// Useful for Render to see if your service is "Alive"
app.get("/", (req, res) => {
  res.status(200).send({
    status: "online",
    message: "PSE Attendance API is running",
    environment: process.env.NODE_ENV || "production",
  });
});

export default app;
