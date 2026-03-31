import "reflect-metadata";
import app from "./app";
import { AppDataSource } from "./config/db";

const PORT = process.env.PORT || 5000;

AppDataSource.initialize()
  .then(() => {
    console.log("🚀 Database connected to Neon!");
    app.listen(PORT, () => {
      console.log(`✅ Server running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => console.log("❌ Connection error:", error));
app.get("/", (req, res) => {
  res.send("🚀 Backend is running and healthy!");
});