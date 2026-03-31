import "reflect-metadata";
import app from "./app";
import { AppDataSource } from "./config/db";

const PORT = process.env.PORT || 5000;
// Use your physical IP address here
const IP_ADDRESS = "192.168.11.31";

AppDataSource.initialize()
  .then(() => {
    console.log("🚀 Database connected to Neon!");

    // Change 'localhost' to '0.0.0.0' to listen to the whole network
    app.listen(Number(PORT), "0.0.0.0", () => {
      console.log(`✅ Server is live!`);
      console.log(`🏠 Local:   http://localhost:${PORT}`);
      console.log(`🌐 Network: http://${IP_ADDRESS}:${PORT}`);
    });
  })
  .catch((error) => console.log("❌ Connection error:", error));
