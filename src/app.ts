import express, { Application } from "express";
import cors from "cors";
import authRoutes from "./routes/authRoute";
import teacherRoutes from "./routes/teacherRoute";
import attendanceRoutes from "./routes/attendentRoute";
import dashboardRoute from "./routes/dashboardRoute";
import path from "path"; // ← fixed

const app: Application = express();

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(express.json());

app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.use("/api/auth", authRoutes);
app.use("/api/teachers", teacherRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/dashboard", dashboardRoute);

export default app;
