import { Request, Response } from "express";
import { AppDataSource } from "../config/db";
import { Attendance } from "../entities/attendance";

export const markAttendance = async (req: Request, res: Response) => {
  const { date, records } = req.body;
  const attendanceRepo = AppDataSource.getRepository(Attendance);

  try {
    // We loop through the IDs sent from the frontend
    const savePromises = Object.entries(records).map(
      async ([teacherId, status]) => {
        // Create a new record for each teacher
        const entry = attendanceRepo.create({
          date: date,
          status: status as string,
          teacher: { id: parseInt(teacherId) } as any,
        });
        return attendanceRepo.save(entry);
      },
    );

    await Promise.all(savePromises);

    res.status(201).json({
      success: true,
      message: "Attendance records synced to Neon successfully!",
    });
  } catch (error) {
    console.error("Attendance Save Error:", error);
    res.status(500).json({ message: "Failed to save attendance records." });
  }
};
