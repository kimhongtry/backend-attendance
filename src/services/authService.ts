import jwt from "jsonwebtoken";
import { AppDataSource } from "../config/db";
import { Admin } from "../entities/Admin";
import { LoginRequestDto } from "../dtos/request/auth";
import { LoginResponseDto } from "../dtos/response/auth";
export class AuthService {
  private adminRepo = AppDataSource.getRepository(Admin);

  async login(data: LoginRequestDto): Promise<LoginResponseDto> {
    const { email, password } = data;

    // 1. Find the admin
    const admin = await this.adminRepo.findOne({
      where: { email },
      select: ["id", "email", "password_hash"],
    });

    // 2. Validate
    if (!admin || password !== admin.password_hash) {
      return { success: false, message: "Invalid email or password" };
    }

    // 3. Generate Token
    const secret = process.env.JWT_SECRET as string;
    const token = jwt.sign({ id: admin.id, role: "admin" }, secret, {
      expiresIn: "8h",
    });

    // 4. Return the Response DTO
    return {
      success: true,
      token,
      admin: { email: admin.email },
    };
  }
}
