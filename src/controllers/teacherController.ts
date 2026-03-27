import { Request, Response } from "express";
import { AppDataSource } from "../config/db";
import { Teacher } from "../entities/teachers";
export const createTeacher = async (req: Request, res: Response) => {
  try {
    const { staffId, name, subject, room } = req.body;

    const teacherRepo = AppDataSource.getRepository(Teacher);

    // Check if Staff ID already exists to prevent duplicates
    const existing = await teacherRepo.findOne({ where: { staffId } });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Staff ID already exists",
      });
    }

    const newTeacher = teacherRepo.create({
      staffId,
      name,
      subject,
      room,
    });

    await teacherRepo.save(newTeacher);

    return res.status(201).json({
      success: true,
      message: "Teacher added successfully!",
      teacher: newTeacher,
    });
  } catch (error) {
    console.error("Add Teacher Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

//Get all teachers
export const getAllTeachers = async (req: Request, res: Response) => {
  try {
    const teacherRepo = AppDataSource.getRepository(Teacher);
    const teachers = await teacherRepo.find();
    return res.json({ success: true, teachers });
  } catch (error) {
    console.error("Get Teachers Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
