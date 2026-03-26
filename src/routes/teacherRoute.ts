import { Router } from "express";
import { getTeachers, addTeacher } from "../controller/teacherController";

const router = Router();

router.get("/", getTeachers);
router.post("/", addTeacher);

export default router;