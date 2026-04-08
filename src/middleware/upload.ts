import multer, { StorageEngine, FileFilterCallback } from "multer";
import { Request } from "express";
import path from "path";
import fs from "fs";

const uploadDir = "uploads/avatars";
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage: StorageEngine = multer.diskStorage({
  destination: (_req: any, _file: any, cb: (arg0: null, arg1: string) => any) => cb(null, uploadDir),
  filename: (_req: any, file: { originalname: string; }, cb: (arg0: null, arg1: string) => void) => {
    const ext = path.extname(file.originalname);
    cb(null, `avatar-${Date.now()}${ext}`);
  },
});

const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback,
) => {
  const allowed = ["image/jpeg", "image/png", "image/webp"];
  allowed.includes(file.mimetype)
    ? cb(null, true)
    : cb(new Error("Only jpg, png, webp allowed"));
};

export const uploadAvatar = multer({
  storage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 },
});
