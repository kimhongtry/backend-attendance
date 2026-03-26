import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { AppDataSource } from "../config/db";
import { Admin } from "../entities/Admin";

export const loginAdmin = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const adminRepo = AppDataSource.getRepository(Admin);

    // Find the admin
    const admin = await adminRepo.findOne({
      where: { email },
      select: ["id", "email", "password_hash"], // password_hash is now just plain text
    });

    if (!admin) {
      return res
        .status(401)
        .json({ success: false, message: "User not found" });
    }

    // 🔴 PLAIN TEXT CHECK (No more bcrypt)
    const isMatch = password === admin.password_hash;

    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Wrong password" });
    }

    // Generate JWT (Keep this for security/dashboard access)
    const secret = process.env.JWT_SECRET as string;
    const token = jwt.sign({ id: admin.id, role: "admin" }, secret, {
      expiresIn: "8h",
    });

    return res.json({ success: true, token, admin: { email: admin.email } });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
