import { Router } from "express";
import {
  changePassword,
  loginAdmin,
  updateProfile,
  getProfile,
} from "../controllers/authController";
import { verifyToken } from "../middleware/auth";
import { uploadAvatar } from "../middleware/upload";

const router = Router();

router.post("/login", loginAdmin);
router.post("/change-password", verifyToken, changePassword);
router.get("/profile", verifyToken, getProfile);
router.put(
  "/profile",
  verifyToken,
  uploadAvatar.single("profile_image"),
  updateProfile,
);

export default router;
