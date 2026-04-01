import express, { Application } from "express";
import cors from "cors";
import authRoutes from "./routes/authRoute";
import teacherRoutes from "./routes/teacherRoute";
import attendanceRoutes from "./routes/attendentRoute"; // ✅ ADDED — was missing, broke everything

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

app.use("/api/auth", authRoutes);
app.use("/api/teachers", teacherRoutes);
app.use("/api/attendance", attendanceRoutes); // ✅ ADDED — was missing, broke everything

export default app;
