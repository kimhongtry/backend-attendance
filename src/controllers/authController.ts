import { Request, Response } from "express";
import { AuthService } from "../services/authService";
import { LoginRequestDto } from "../dtos/request/auth";
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
