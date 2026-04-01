import { Router, RequestHandler } from "express";
import {
  publicCheckIn,
  qrCheckIn,
  markAttendance,
  getTodayAttendance,
} from "../controllers/attendanceController";
import { verifyToken } from "../middleware/auth"; // your existing middleware

const router = Router();

// ✅ No auth — access is gated by WiFi IP check inside the controller
router.post("/public-checkin", publicCheckIn);

// ✅ Teacher must be logged in on their phone (token required)
router.post("/qr-checkin", verifyToken, qrCheckIn as unknown as RequestHandler);

// ✅ Admin manual bulk entry (token required)
router.post("/mark", verifyToken, markAttendance as RequestHandler);
router.get("/today", verifyToken, getTodayAttendance);

export default router;
