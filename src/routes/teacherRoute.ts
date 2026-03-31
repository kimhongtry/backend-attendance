import { Router } from "express";
import { AppDataSource } from "../config/db";
import { Teacher } from "../entities/teachers";

const router = Router();

// 👉 create repository HERE (this replaces your missing repo file)
const teacherRepo = AppDataSource.getRepository(Teacher);

// ✅ GET ALL
router.get("/all", async (req, res) => {
  const teachers = await teacherRepo.find();
  res.json(teachers);
});

// ✅ ADD
router.post("/add", async (req, res) => {
  const teacher = teacherRepo.create(req.body);
  await teacherRepo.save(teacher);
  res.json({ message: "Added" });
});



export default router;