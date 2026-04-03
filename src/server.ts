import "reflect-metadata";
import app from "./app";
import { AppDataSource } from "./config/db";

// 1. Setup Port and IP
const PORT = process.env.PORT || 5000;
const IP_ADDRESS = "192.168.11.36"; // Your current Ubuntu IP

// 2. Health Check (To test on your phone browser)
app.get("/", (req, res) => {
  res.send(`
    <div style="text-align: center; font-family: sans-serif; margin-top: 50px;">
      <h1 style="color: #4f46e5;">✅ Backend is Reachable!</h1>
      <p>Your phone is successfully talking to your computer.</p>
      <p>IP: ${IP_ADDRESS} | Port: ${PORT}</p>
    </div>
  `);
});

AppDataSource.initialize()
  .then(() => {
    console.log("🚀 Database connected to Neon!");

    // This tells the server to listen to the Wi-Fi, not just your laptop.
    app.listen(Number(PORT), "0.0.0.0", () => {
      console.log(`🚀 Server is listening on 0.0.0.0:${PORT}`);
      console.log(`🌐 Phone should visit: http://192.168.11.36:5000`);
    });
  })
  .catch((error) => console.log("❌ Connection error:", error));
app.get("/", (req, res) => {
  res.send("🚀 Backend is running and healthy!");
});
