import "reflect-metadata";
import app from "./app";
import { AppDataSource } from "./config/db";

// Use Render's dynamic port
const PORT = process.env.PORT || 5000;

// Health Check (Good for Render to see the app is alive)
app.get("/", (req, res) => {
  res.send(`
    <div style="text-align: center; font-family: sans-serif; margin-top: 50px;">
      <h1 style="color: #4f46e5;">✅ Backend is Live!</h1>
      <p>The Attendance System is running on the cloud.</p>
      <p>Connected to: ${process.env.FRONTEND_URL || "Localhost"}</p>
    </div>
  `);
});

AppDataSource.initialize()
  .then(() => {
    console.log("🚀 Database connected to Neon!");

    // "0.0.0.0" is essential for Render to routing
    app.listen(Number(PORT), "0.0.0.0", () => {
      console.log(`🚀 Server is listening on port ${PORT}`);
    });
  })
  .catch((error) => console.log("❌ Connection error:", error));
