import { Request, Response } from "express";
import { TeacherService } from "../service/teacherService";

export const getTeachers = async (req: Request, res: Response) => {
  try {
    const data = await TeacherService.getAll();
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const addTeacher = async (req: Request, res: Response) => {
  try {
    const newTeacher = await TeacherService.create(req.body);
    res.status(201).json(newTeacher);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};