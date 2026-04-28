import { Router } from "express";
import {
  changePassword,
  loginAdmin,
  updateProfile,
  getProfile,
} from "../controllers/authController";
import { verifyToken } from "../middleware/auth";
import { uploadAvatar } from "../middleware/upload";
import { rateLimit } from "express-rate-limit";

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 attempts per 15 minutes
  message: {
    message: "Too many login attempts. Please try again after 15 minutes.",
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

const router = Router();

router.post("/login", loginAdmin, loginLimiter);
router.post("/change-password", verifyToken, changePassword);
router.get("/profile", verifyToken, getProfile);
router.put(
  "/profile",
  verifyToken,
  uploadAvatar.single("profile_image"),
  updateProfile,
);

export default router;
