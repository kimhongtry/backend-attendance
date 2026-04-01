import { Request, Response } from "express";
import { AttendanceService } from "../services/attendanceService";
import { MarkAttendanceRequestDto } from "../dtos/request/attendance";
import { AppDataSource } from "../config/db";
import { Attendance } from "../entities/attendance";
import { Teacher } from "../entities/teachers";

interface AuthenticatedRequest extends Request {
  user: { id: number };
}

// ✅ Single instance at the top — correct pattern
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
    return res.status(500).json({
      success: false,
      message: "Failed to record attendance.",
    });
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

    // ✅ Prevent double check-in
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

    // ✅ Save present record
    const newRecord = attendanceRepo.create({
      date: today,
      status: "present",
      checkInMethod: "QR_SCAN",
    });
    newRecord.teacher = { id: teacherId } as any;

    await attendanceRepo.save(newRecord);

    return res.status(200).json({
      success: true,
      message: "Check-in successful!",
    });
  } catch (error) {
    console.error("QR Check-in Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error during check-in.",
    });
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
      return res.status(400).json({
        success: false,
        message: "Staff ID and name are required.",
      });
    }

    const today = new Date().toISOString().split("T")[0];

    // ✅ WiFi/IP validation — works for both IPv4 and IPv6-mapped addresses
    const clientIp = req.ip || req.socket.remoteAddress || "";
    const isLocal =
      clientIp.includes("192.168.11") || // LAN IPv4
      clientIp === "::1" || // localhost IPv6
      clientIp === "127.0.0.1"; // localhost IPv4

    if (!isLocal) {
      return res.status(403).json({
        success: false,
        message:
          "Access Denied: You must be connected to the PSE Campus Wi-Fi.",
      });
    }

    const attendanceRepo = AppDataSource.getRepository(Attendance);
    const teacherRepo = AppDataSource.getRepository(Teacher);

    // ✅ Verify teacher exists by staffId
    const teacher = await teacherRepo.findOne({ where: { staffId } });
    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: "Staff ID not found in system.",
      });
    }

    // ✅ Prevent double check-in
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

    // ✅ Save record
    const record = attendanceRepo.create({
      date: today,
      status: "present",
      checkInMethod: "QR_PUBLIC",
      teacher: teacher,
    });

    await attendanceRepo.save(record);

    return res.status(200).json({
      success: true,
      message: `Attendance marked! Welcome, ${teacher.name}.`,
    });
  } catch (error) {
    console.error("Public Check-in Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error during check-in.",
    });
  }
};
// ─────────────────────────────────────────────
// ADD THIS to attendanceController.ts
// GET /api/attendance/today
// Returns all attendance records for today so the
// frontend can sync QR scans in real-time
// ─────────────────────────────────────────────

export const getTodayAttendance = async (req: Request, res: Response) => {
  try {
    const today = new Date().toISOString().split("T")[0];
    const attendanceRepo = AppDataSource.getRepository(Attendance);

    const records = await attendanceRepo
      .createQueryBuilder("attendance")
      .leftJoinAndSelect("attendance.teacher", "teacher")
      .where("attendance.date = :today", { today })
      .getMany();

    // ✅ Return flat array the frontend expects
    const result = records.map((r) => ({
      teacherId: r.teacher.id,
      status: r.status,
      checkInMethod: r.checkInMethod,
    }));

    return res.status(200).json(result);
  } catch (error) {
    console.error("Get Today Attendance Error:", error);
    return res
      .status(500)
      .json({ message: "Failed to fetch today's attendance." });
  }
};
