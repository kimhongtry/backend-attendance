import express, { Application } from "express";
import cors from "cors";
import authRoutes from "./routes/authRoute";
import teacherRoutes from "./routes/teacherRoute";
import attendanceRoutes from "./routes/attendentRoute"; //  ADDED — was missing, broke everything
import dashboardRoute from "./routes/dashboardRoute"; // FIXED: 'd' instead of 't'
import path from "path/win32";

const app: Application = express();

// ✅ Single CORS config — duplicates removed
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(express.json());
// Serve uploaded images
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/teachers", teacherRoutes);
app.use("/api/attendance", attendanceRoutes); // ✅ ADDED — was missing, broke everything
app.use("/api/dashboard", dashboardRoute); // FIXED: spelling matches filename

export default app;
