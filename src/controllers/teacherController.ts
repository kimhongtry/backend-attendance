import { Request, Response } from "express";
import { TeacherService } from "../services/teacherService";
import { CreateTeacherRequestDto } from "../dtos/request/teacher";

const teacherService = new TeacherService();

export const createTeacher = async (req: Request, res: Response) => {
  try {
    const dto: CreateTeacherRequestDto = req.body;
    const result = await teacherService.create(dto);

    if (typeof result === "string") {
      return res.status(400).json({ success: false, message: result });
    }

    return res.status(201).json({
      success: true,
      message: "Teacher added successfully!",
      teacher: result,
    });
  } catch (error: any) {
    console.error("Create Teacher Error:", error.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getAllTeachers = async (req: Request, res: Response) => {
  try {
    const teachers = await teacherService.getAll();
    return res.status(200).json({ success: true, teachers });
  } catch (error: any) {
    console.error("Get All Teachers Error:", error.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const updateTeacher = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string);
8789 
    // Safety check: Ensure ID is a valid number
    if (isNaN(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid ID format" });
    }

    const result = await teacherService.update(id, req.body);

    if (typeof result === "string") {
      return res.status(400).json({ success: false, message: result });
    }

    return res.status(200).json({
      success: true,
      message: "Teacher updated successfully",
      teacher: result,
    });
  } catch (error: any) {
    console.error("Update Teacher Error:", error.message);
    return res.status(500).json({ success: false, message: "Update failed" });
  }
};

export const deleteTeacher = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string);

    if (isNaN(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid ID format" });
    }

    const success = await teacherService.delete(id);

    if (!success) {
      return res
        .status(404)
        .json({ success: false, message: "Teacher not found" });
    }

    return res
      .status(200)
      .json({ success: true, message: "Teacher deleted permanently" });
  } catch (error: any) {
    console.error("Delete Teacher Error:", error.message);
    return res.status(500).json({ success: false, message: "Delete failed" });
  }
};
