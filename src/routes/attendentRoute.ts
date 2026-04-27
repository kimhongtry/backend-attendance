import { Router, RequestHandler } from "express";
import {
  publicCheckIn,
  // qrCheckIn, <-- REMOVED this because it doesn't exist in your controller
  markAttendance,
  getTodayAttendance,
  getDailyReport,
  getWeeklyReport,
  sendTelegramReport,
} from "../controllers/attendanceController";
import { verifyToken } from "../middleware/auth";

const router = Router();

// ✅ Gated by Geofencing (GPS) inside the controller
router.post("/public-checkin", publicCheckIn);

// ✅ Admin manual bulk entry
router.post("/mark", verifyToken, markAttendance as RequestHandler);

// ✅ Fetching attendance data
router.get("/today", verifyToken, getTodayAttendance);

// ✅ Report routes
router.get("/report/daily", verifyToken, getDailyReport as RequestHandler);
router.get("/report/weekly", verifyToken, getWeeklyReport as RequestHandler);

// ✅ Telegram Export
router.post(
  "/report/send-telegram",
  verifyToken,
  sendTelegramReport as RequestHandler,
);

export default router;
