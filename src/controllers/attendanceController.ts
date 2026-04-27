import * as dns from "dns";
dns.setDefaultResultOrder("ipv4first");

import { Request, Response } from "express";
import axios from "axios";
import { AttendanceService } from "../services/attendanceService";
import { MarkAttendanceRequestDto } from "../dtos/request/attendance";
import { AppDataSource } from "../config/db";
import { Attendance } from "../entities/attendance";
import { Teacher } from "../entities/teachers";

interface AuthenticatedRequest extends Request {
  user: { id: number };
}

const attendanceService = new AttendanceService();

// ─────────────────────────────────────────────
// ADMIN: Manual bulk attendance entry
// POST /api/attendance/mark
// ─────────────────────────────────────────────
export const markAttendance = async (req: Request, res: Response) => {
  try {
    const dto: MarkAttendanceRequestDto = req.body;
    const result = await attendanceService.markTeachersAttendance(dto);
    return res.status(201).json(result);
  } catch (error) {
    console.error("Attendance Controller Error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to record attendance." });
  }
};

// 1. SET YOUR SCHOOL LOCATION (Get these from Google Maps)
const SCHOOL_LAT = 11.524451;
const SCHOOL_LON = 104.881473;
const MAX_DISTANCE_METERS = 20; // Allowed radius (e.g., 100 meters)

// Helper: Calculate distance between two points in meters
function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371e3; // Earth radius in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// ─────────────────────────────────────────────
// PUBLIC: QR check-in (Geofencing Gated)
// POST /api/attendance/public-checkin
// ─────────────────────────────────────────────
export const publicCheckIn = async (req: Request, res: Response) => {
  try {
    const { staffId, name, lat, lon } = req.body;

    if (!staffId || !name || !lat || !lon) {
      return res.status(400).json({
        success: false,
        message: "Staff ID, name, and Location are required.",
      });
    }

    const distance = getDistance(lat, lon, SCHOOL_LAT, SCHOOL_LON);

    // If teacher is more than 100m away, block them
    if (distance > MAX_DISTANCE_METERS) {
      return res.status(403).json({
        success: false,
        message: `Access Denied: You are ${Math.round(distance)}m away. You must be on the PSE campus.`,
      });
    }

    const today = new Date().toISOString().split("T")[0];
    const attendanceRepo = AppDataSource.getRepository(Attendance);
    const teacherRepo = AppDataSource.getRepository(Teacher);

    const teacher = await teacherRepo.findOne({ where: { staffId } });
    if (!teacher) {
      return res
        .status(404)
        .json({ success: false, message: "Staff ID not found." });
    }

    const existing = await attendanceRepo
      .createQueryBuilder("attendance")
      .where("attendance.teacherId = :id", { id: teacher.id })
      .andWhere("attendance.date = :today", { today })
      .getOne();

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Attendance already recorded today.",
      });
    }

    const record = attendanceRepo.create({
      date: today,
      status: "present",
      checkInMethod: "QR_PUBLIC",
      teacher,
    });
    await attendanceRepo.save(record);

    return res.status(200).json({
      success: true,
      message: `Success! Welcome, ${teacher.name}.`,
    });
  } catch (error) {
    console.error("Public Check-in Error:", error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};
// ─────────────────────────────────────────────
// GET today's attendance (real-time sync)
// GET /api/attendance/today
// ─────────────────────────────────────────────
export const getTodayAttendance = async (req: Request, res: Response) => {
  try {
    const result = await attendanceService.getTodayAttendance();
    return res.status(200).json(result);
  } catch (error) {
    console.error("Get Today Attendance Error:", error);
    return res
      .status(500)
      .json({ message: "Failed to fetch today's attendance." });
  }
};

// ─────────────────────────────────────────────
// Daily report
// GET /api/attendance/report/daily?date=2026-04-01
// ─────────────────────────────────────────────
export const getDailyReport = async (req: Request, res: Response) => {
  try {
    const date =
      (req.query.date as string) || new Date().toISOString().split("T")[0];
    const result = await attendanceService.getDailyReport(date);
    return res.status(200).json(result);
  } catch (error) {
    console.error("Daily Report Error:", error);
    return res.status(500).json({ message: "Failed to fetch daily report." });
  }
};

// ─────────────────────────────────────────────
// Weekly report
// GET /api/attendance/report/weekly?start=2026-03-25&end=2026-03-31
// ─────────────────────────────────────────────
export const getWeeklyReport = async (req: Request, res: Response) => {
  try {
    const { start, end } = req.query as { start: string; end: string };
    if (!start || !end) {
      return res
        .status(400)
        .json({ message: "start and end dates are required." });
    }
    const result = await attendanceService.getWeeklyReport(start, end);
    return res.status(200).json(result);
  } catch (error) {
    console.error("Weekly Report Error:", error);
    return res.status(500).json({ message: "Failed to fetch weekly report." });
  }
};

// ─────────────────────────────────────────────
// Send daily report to Telegram
// POST /api/attendance/report/send-telegram?date=2026-04-01
// ─────────────────────────────────────────────
export const sendTelegramReport = async (req: Request, res: Response) => {
  try {
    const date =
      (req.query.date as string) || new Date().toISOString().split("T")[0];
    const report = await attendanceService.getDailyReport(date);

    const present = report.records.filter((r) => r.status === "present");
    const absent = report.records.filter((r) => r.status === "absent");
    const permission = report.records.filter((r) => r.status === "permission");

    const formattedDate = new Date(date).toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });

    const attendanceRate =
      report.total > 0 ? Math.round((present.length / report.total) * 100) : 0;

    const message = `
🏫 *PSE TEACHER ATTENDANCE REPORT*
📅 *Date:* ${formattedDate}
─────────────────────────
📊 *Summary*
Total Registered: *${report.total} teachers*
Total Marked: *${report.records.length} teachers*
Attendance Rate: *${attendanceRate}%*
─────────────────────────
*Present (${present.length})*
${present.length > 0 ? present.map((r, i) => `${i + 1}. ${r.teacherName}`).join("\n") : "— None —"}
 
*Absent (${absent.length})*
${absent.length > 0 ? absent.map((r, i) => `${i + 1}. ${r.teacherName}`).join("\n") : "— None —"}
 
*On Permission (${permission.length})*
${permission.length > 0 ? permission.map((r, i) => `${i + 1}. ${r.teacherName}`).join("\n") : "— None —"}
─────────────────────────
_Report generated by PSE Attendance System_
_${new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })} · Submitted by Admin_
    `.trim();

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    await axios.post(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      { chat_id: chatId, text: message, parse_mode: "Markdown" },
      { family: 4 } as any,
    );

    return res
      .status(200)
      .json({ success: true, message: "Report sent to Telegram!" });
  } catch (error: any) {
    console.error("Telegram Send Error:", error?.response?.data || error);
    return res.status(500).json({
      success: false,
      message: error?.response?.data?.description || "Failed to send report.",
    });
  }
};
