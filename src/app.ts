import express, { Application } from "express";
import cors from "cors";
import authRoutes from "./routes/authRoute";
import teacherRoutes from "./routes/teacherRoute";
import dashboardRoute from "./routes/dashboardRoute"; // FIXED: 'd' instead of 't'

const app: Application = express();

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/teachers", teacherRoutes);
app.use("/api/dashboard", dashboardRoute); // FIXED: spelling matches filename

export default app;