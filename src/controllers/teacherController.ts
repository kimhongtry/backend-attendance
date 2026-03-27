import { Request, Response } from "express";
import { TeacherService } from "../services/teacherService";
import { CreateTeacherRequestDto } from "../dtos/request/teacher";

// Create the instance here
const teacherService = new TeacherService();

export const createTeacher = async (req: Request, res: Response) => {
  try {
    const dto: CreateTeacherRequestDto = req.body;

    // Use the instance (lowercase 't')
    const result = await teacherService.create(dto);

    if (typeof result === "string") {
      return res.status(400).json({ success: false, message: result });
    }

    return res.status(201).json({
      success: true,
      message: "Teacher added!",
      teacher: result,
    });
  } catch (error: any) {
    console.error("Create Teacher Error:", error.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getAllTeachers = async (req: Request, res: Response) => {
  try {
    // Use the instance (lowercase 't')
    const teachers = await teacherService.getAll();
    return res.status(200).json({ success: true, teachers });
  } catch (error: any) {
    console.error("Get All Teachers Error:", error.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
