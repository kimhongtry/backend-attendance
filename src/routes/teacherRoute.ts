import { Router } from "express";
import {
  createTeacher,
  getAllTeachers,
} from "../controllers/teacherController";
import { verifyToken } from "../middleware/auth";
import { markAttendance } from "../controllers/attendanceController";

const router = Router();

// This makes the URL: http://localhost:5000/api/teachers/all
router.get("/all", verifyToken, getAllTeachers);

// This makes the URL: http://localhost:5000/api/teachers/add
router.post("/add", verifyToken, createTeacher);
router.post("/mark", verifyToken, markAttendance);
export default router;
