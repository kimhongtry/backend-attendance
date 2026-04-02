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

// ─────────────────────────────────────────────
// TEACHER: QR check-in (requires login token)
// POST /api/attendance/qr-checkin
// ─────────────────────────────────────────────
export const qrCheckIn = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const teacherId = req.user.id;
    const today = new Date().toISOString().split("T")[0];
    const attendanceRepo = AppDataSource.getRepository(Attendance);

    const existing = await attendanceRepo
      .createQueryBuilder("attendance")
      .leftJoinAndSelect("attendance.teacher", "teacher")
      .where("teacher.id = :teacherId", { teacherId })
      .andWhere("attendance.date = :today", { today })
      .getOne();

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "You are already marked present today!",
      });
    }

    const newRecord = attendanceRepo.create({
      date: today,
      status: "present",
      checkInMethod: "QR_SCAN",
    });
    newRecord.teacher = { id: teacherId } as any;
    await attendanceRepo.save(newRecord);

    return res
      .status(200)
      .json({ success: true, message: "Check-in successful!" });
  } catch (error) {
    console.error("QR Check-in Error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Server error during check-in." });
  }
};

// ─────────────────────────────────────────────
// PUBLIC: QR check-in (no login — WiFi gated)
// POST /api/attendance/public-checkin
// ─────────────────────────────────────────────
export const publicCheckIn = async (req: Request, res: Response) => {
  try {
    const { staffId, name } = req.body;

    if (!staffId || !name) {
      return res
        .status(400)
        .json({ success: false, message: "Staff ID and name are required." });
    }

    const today = new Date().toISOString().split("T")[0];
    const clientIp = req.ip || req.socket.remoteAddress || "";
    const isLocal =
      clientIp.includes("192.168.11") ||
      clientIp === "::1" ||
      clientIp === "127.0.0.1";

    if (!isLocal) {
      return res.status(403).json({
        success: false,
        message:
          "Access Denied: You must be connected to the PSE Campus Wi-Fi.",
      });
    }

    const attendanceRepo = AppDataSource.getRepository(Attendance);
    const teacherRepo = AppDataSource.getRepository(Teacher);

    const teacher = await teacherRepo.findOne({ where: { staffId } });
    if (!teacher) {
      return res
        .status(404)
        .json({ success: false, message: "Staff ID not found in system." });
    }

    const existing = await attendanceRepo
      .createQueryBuilder("attendance")
      .where("attendance.teacherId = :id", { id: teacher.id })
      .andWhere("attendance.date = :today", { today })
      .getOne();

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Attendance already recorded for today.",
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
      message: `Attendance marked! Welcome, ${teacher.name}.`,
    });
  } catch (error) {
    console.error("Public Check-in Error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Server error during check-in." });
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
