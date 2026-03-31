import { Router } from "express";
import { publicCheckIn } from "../controllers/attendanceController";

const router = Router();

// Notice: NO verifyToken here because it's for the public/teachers
router.post("/public-checkin", publicCheckIn);

export default router;
