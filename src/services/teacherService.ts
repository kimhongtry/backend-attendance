import { AppDataSource } from "../config/db";
import { Teacher } from "../entities/teachers";
import { TeacherResponseDto } from "../dtos/response/teacher";
import { CreateTeacherRequestDto } from "../dtos/request/teacher";

export class TeacherService {
  private repo = AppDataSource.getRepository(Teacher);

  // Remove the static methods that were throwing errors!

  async create(
    dto: CreateTeacherRequestDto,
  ): Promise<TeacherResponseDto | string> {
    const existing = await this.repo.findOne({
      where: { staffId: dto.staffId },
    });
    if (existing) return "Staff ID already exists";

    const teacher = this.repo.create(dto);
    const saved = await this.repo.save(teacher);

    return {
      id: saved.id,
      staffId: saved.staffId,
      name: saved.name,
      subject: saved.subject,
      room: saved.room,
    };
  }

  async getAll(): Promise<TeacherResponseDto[]> {
    const teachers = await this.repo.find();
    return teachers.map((t) => ({
      id: t.id,
      staffId: t.staffId,
      name: t.name,
      subject: t.subject,
      room: t.room,
    }));
  }
}
