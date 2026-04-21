import jwt from "jsonwebtoken";
import { AppDataSource } from "../config/db";
import { Admin } from "../entities/Admin";
import { LoginRequestDto } from "../dtos/request/auth";
import { LoginResponseDto } from "../dtos/response/auth";
import bcrypt from "bcrypt";
import fs from "fs";
import path from "path";
import { ChangePasswordRequestDto } from "../dtos/request/auth";
import { ChangePasswordResponseDto } from "../dtos/response/auth";
import { UpdateProfileRequestDto } from "../dtos/request/auth";
import { UpdateProfileResponseDto } from "../dtos/response/auth";

const BASE_URL = process.env.BASE_URL || "http://192.168.11.41:5000";
export class AuthService {
  private adminRepo = AppDataSource.getRepository(Admin);

  async login(data: LoginRequestDto): Promise<LoginResponseDto> {
    const { email, password } = data;

    // 1. Find the admin
    const admin = await this.adminRepo.findOne({
      where: { email },
      select: ["id", "email", "password_hash"],
    });

    if (!admin) {
      return { success: false, message: "Invalid email or password" };
    }

    const isMatch = await bcrypt.compare(password, admin.password_hash);
    if (!isMatch) {
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
  async changePassword(
    adminId: number,
    data: ChangePasswordRequestDto,
  ): Promise<ChangePasswordResponseDto> {
    const { currentPassword, newPassword } = data;

    // 1. Fetch admin with password_hash
    const admin = await this.adminRepo.findOne({
      where: { id: adminId },
      select: ["id", "password_hash"],
    });

    if (!admin) {
      return { success: false, message: "Admin not found." };
    }

    // 2. Compare current password against hash
    const isMatch = await bcrypt.compare(currentPassword, admin.password_hash);
    if (!isMatch) {
      return { success: false, message: "Current password is incorrect." };
    }

    // 3. Validate new password
    if (newPassword.length < 6) {
      return {
        success: false,
        message: "Password must be at least 6 characters.",
      };
    }

    // 4. Hash and save
    const salt = await bcrypt.genSalt(10);
    admin.password_hash = await bcrypt.hash(newPassword, salt);
    await this.adminRepo.save(admin);

    return { success: true, message: "Password updated successfully." };
  }

  // ─── Get Profile ──────────────────────────────────────────
  async getProfile(adminId: number): Promise<UpdateProfileResponseDto> {
    const admin = await this.adminRepo.findOne({
      where: { id: adminId },
      select: ["id", "username", "email", "profile_image"],
    });

    if (!admin) return { success: false, message: "Admin not found." };

    // Strip full URL if accidentally stored, keep only filename
    const filename = admin.profile_image
      ? admin.profile_image.replace(`${BASE_URL}/uploads/avatars/`, "")
      : null;

    return {
      success: true,
      message: "OK",
      admin: {
        username: admin.username,
        email: admin.email,
        profile_image: filename
          ? `${BASE_URL}/uploads/avatars/${filename}`
          : null,
      },
    };
  }
  // ─── Update Profile ───────────────────────────────────────
  async updateProfile(
    adminId: number,
    data: UpdateProfileRequestDto,
    filename?: string,
  ): Promise<UpdateProfileResponseDto> {
    const admin = await this.adminRepo.findOne({ where: { id: adminId } });
    if (!admin) return { success: false, message: "Admin not found." };

    if (data.username) admin.username = data.username;
    if (data.email) admin.email = data.email;

    if (filename) {
      // Delete old image — strip base URL first to get just the filename
      if (admin.profile_image) {
        const oldFilename = admin.profile_image.replace(
          `${BASE_URL}/uploads/avatars/`,
          "",
        );
        const oldPath = path.join("uploads/avatars", oldFilename);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      // Save only the filename in DB, not the full URL
      admin.profile_image = filename;
    }

    await this.adminRepo.save(admin);

    return {
      success: true,
      message: "Profile updated successfully.",
      admin: {
        username: admin.username,
        email: admin.email,
        profile_image: admin.profile_image
          ? `${BASE_URL}/uploads/avatars/${admin.profile_image}`
          : null,
      },
    };
  }
}
