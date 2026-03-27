import { Request, Response } from "express";
import { AttendanceService } from "../services/attendanceService";
import { MarkAttendanceRequestDto } from "../dtos/request/attendance";
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
