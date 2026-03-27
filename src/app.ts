import express, { Application } from "express";
import cors from "cors";
import authRoutes from "./routes/authRoute";
import teacherRoutes from "./routes/teacherRoute";

const app: Application = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/teachers", teacherRoutes);

export default app;
