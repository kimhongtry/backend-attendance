import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoute";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("API running 🚀");
});

app.use("/api/auth", authRoutes);

// fix favicon error
app.get("/favicon.ico", (req, res) => res.status(204).end());

app.use((req, res) => {
  console.log("❌ Route not found:", req.method, req.url);
  res.status(404).json({ message: "Route not found" });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
