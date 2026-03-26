import { AppDataSource } from "../config/db";
import { Teacher } from "../models/Teacher";

export class TeacherService {
  private static teacherRepo = AppDataSource.getRepository(Teacher);

  static async getAll() {
    return await this.teacherRepo.find();
  }

  static async create(data: any) {
    const teacher = this.teacherRepo.create(data);
    return await this.teacherRepo.save(teacher);
  }

  static async delete(id: number) {
    return await this.teacherRepo.delete(id);
  }
}