import express, { Application } from "express";
import cors from "cors";
import authRoutes from "./routes/authRoute";

const app: Application = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);

export default app;
