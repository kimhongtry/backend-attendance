import { Router } from "express";
import { getDashboardStats } from "../controllers/dashboardController";
import { verifyToken } from "../middleware/auth";

const router = Router();

// Full URL: GET http://localhost:5000/api/dashboard/stats
router.get("/stats", verifyToken, getDashboardStats);

export default router;