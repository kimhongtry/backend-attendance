import "reflect-metadata";
import app from "./app";
import { AppDataSource } from "./config/db";

const PORT = process.env.PORT || 5000;
const IP_ADDRESS = "192.168.11.41"; // Your current Ubuntu IP

// ── Health Check ──────────────────────────────────────────────────────────────
app.get("/", (req, res) => {
  res.send(`
    <div style="text-align: center; font-family: sans-serif; margin-top: 50px;">
      <h1 style="color: #4f46e5;">✅ Backend is Reachable!</h1>
      <p>Your phone is successfully talking to your computer.</p>
      <p>IP: ${IP_ADDRESS} | Port: ${PORT}</p>
    </div>
  `);
});

// ── Connect Database then Start Server ────────────────────────────────────────
AppDataSource.initialize()
  .then(() => {
    console.log("🚀 Database connected successfully!");
    console.log("📊 DB Status:", AppDataSource.isInitialized);

    app.listen(Number(PORT), "0.0.0.0", () => {
      console.log(`✅ Server is listening on 0.0.0.0:${PORT}`);
      console.log(`🌐 Access on network: http://${IP_ADDRESS}:${PORT}`);
    });
  })
  .catch((error) => {
    console.log("❌ Database connection error:", error);
    process.exit(1);
  });
  