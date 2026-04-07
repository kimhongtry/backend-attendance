import { Request, Response } from "express";
import { AuthService } from "../services/authService";
import { LoginRequestDto, UpdateProfileRequestDto } from "../dtos/request/auth";
import { ChangePasswordRequestDto } from "../dtos/request/auth";

interface CustomRequest extends Request {
  user?: { id: number };
}

const authService = new AuthService();

export const loginAdmin = async (req: Request, res: Response) => {
  try {
    // Cast the body to our Request DTO
    const loginData: LoginRequestDto = req.body;

    // Call the service logic
    const result = await authService.login(loginData);

    // If login failed, send 401
    if (!result.success) {
      return res.status(401).json(result);
    }

    // If success, send 200
    return res.status(200).json(result);
  } catch (error) {
    console.error("Auth Controller Error:", error);
    return res.status(500).json({
      success: false,
      message: "An unexpected server error occurred",
    });
  }
};
export const changePassword = async (req: CustomRequest, res: Response) => {
  try {
    const adminId = req.user?.id;
    if (!adminId) {
      return res.status(401).json({ success: false, message: "Unauthorized." });
    }

    const data: ChangePasswordRequestDto = req.body;

    if (!data.currentPassword || !data.newPassword) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required." });
    }

    const result = await authService.changePassword(adminId, data);

    return res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    console.error("Change Password Error:", error);
    return res.status(500).json({
      success: false,
      message: "An unexpected server error occurred.",
    });
  }
};

// ─── Get Profile ──────────────────────────────────────────
export const getProfile = async (req: CustomRequest, res: Response) => {
  try {
    const adminId = req.user?.id;
    if (!adminId) {
      return res.status(401).json({ success: false, message: "Unauthorized." });
    }

    const result = await authService.getProfile(adminId);
    return res.status(result.success ? 200 : 404).json(result);
  } catch (error) {
    console.error("Get Profile Error:", error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

// ─── Update Profile ───────────────────────────────────────
export const updateProfile = async (req: CustomRequest, res: Response) => {
  try {
    const adminId = req.user?.id;
    if (!adminId) {
      return res.status(401).json({ success: false, message: "Unauthorized." });
    }

    const data: UpdateProfileRequestDto = req.body;
    const filename = (req.file as Express.Multer.File)?.filename;

    const result = await authService.updateProfile(adminId, data, filename);
    return res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    console.error("Update Profile Error:", error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};
