import { Request, Response } from "express";
import { AttendanceService } from "../services/attendanceService";
import { MarkAttendanceRequestDto } from "../dtos/request/attendance";
import { AppDataSource } from "../config/db";
import { Attendance } from "../entities/attendance";
import { Teacher } from "../entities/teachers";

interface AuthenticatedRequest extends Request {
  user: { id: number };
}

// Create the instance once at the top
const attendanceService = new AttendanceService();

export const markAttendance = async (req: Request, res: Response) => {
  try {
    const dto: MarkAttendanceRequestDto = req.body;

    // Call the instance method (no 'static' errors here!)
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
export const qrCheckIn = async (req: AuthenticatedRequest, res: Response) => {
  try {
    // 1. Get Teacher ID from the token (the teacher must be logged in on their phone)
    const teacherId = req.user.id;
    const today = new Date().toISOString().split("T")[0];

    const attendanceRepo = AppDataSource.getRepository(Attendance);

    // 2. Prevent double check-in
    const existing = await attendanceRepo
      .createQueryBuilder("attendance")
      .leftJoinAndSelect("attendance.teacher", "teacher")
      .where("teacher.id = :teacherId", { teacherId })
      .andWhere("attendance.date = :today", { today })
      .getOne();

    if (existing) {
      return res
        .status(400)
        .json({ message: "You are already marked present today!" });
    }

    // 3. Save "Present" status
    const newRecord = attendanceRepo.create({
      date: today,
      status: "present",
    });
    newRecord.teacher = { id: teacherId } as any;
    newRecord.checkInMethod = "QR_SCAN";

    await attendanceRepo.save(newRecord);
    return res
      .status(200)
      .json({ success: true, message: "Check-in successful!" });
  } catch (error) {
    return res.status(500).json({ message: "Server error during check-in" });
  }
};
export const publicCheckIn = async (req: Request, res: Response) => {
  try {
    const { staffId, name } = req.body;
    const today = new Date().toISOString().split("T")[0];

    const attendanceRepo = AppDataSource.getRepository(Attendance);
    const teacherRepo = AppDataSource.getRepository(Teacher);

    // 1. Verify this teacher actually exists in your DB
    const teacher = await teacherRepo.findOne({ where: { staffId } });
    if (!teacher) {
      return res.status(404).json({ message: "Staff ID not found in system." });
    }

    // 2. Double-check on server side as well
    const existing = await attendanceRepo
      .createQueryBuilder("attendance")
      .leftJoinAndSelect("attendance.teacher", "teacher")
      .where("teacher.id = :teacherId", { teacherId: teacher.id })
      .andWhere("attendance.date = :today", { today })
      .getOne();

    if (existing) {
      return res
        .status(400)
        .json({ message: "Attendance already recorded for today." });
    }

    // 3. Save the record
    const record = attendanceRepo.create({
      date: today,
      status: "present",
      checkInMethod: "QR_PUBLIC",
    });
    record.teacher = { id: teacher.id } as any;

    await attendanceRepo.save(record);
    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
};
