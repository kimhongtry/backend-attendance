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

  // Add these to your existing TeacherService class
  async update(
    id: number,
    dto: Partial<CreateTeacherRequestDto>,
  ): Promise<TeacherResponseDto | string> {
    const teacher = await this.repo.findOne({ where: { id } });
    if (!teacher) return "Teacher not found";

    // If changing staffId, check if the new one is already taken by someone else
    if (dto.staffId && dto.staffId !== teacher.staffId) {
      const existing = await this.repo.findOne({
        where: { staffId: dto.staffId },
      });
      if (existing) return "New Staff ID is already in use";
    }

    // Merge changes and save
    Object.assign(teacher, dto);
    const updated = await this.repo.save(teacher);

    return {
      id: updated.id,
      staffId: updated.staffId,
      name: updated.name,
      subject: updated.subject,
      room: updated.room,
    };
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.repo.delete(id);
    return (result.affected ?? 0) > 0;
  }
}
