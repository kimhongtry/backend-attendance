import { AppDataSource } from "../config/db";
import { Attendance } from "../entities/attendance";
import { MarkAttendanceRequestDto } from "../dtos/request/attendance";
import { AttendanceResponseDto } from "../dtos/response/attendance";

export class AttendanceService {
  private repo = AppDataSource.getRepository(Attendance);

  async markTeachersAttendance(
    data: MarkAttendanceRequestDto,
  ): Promise<AttendanceResponseDto> {
    const { date, records } = data;

    const savePromises = Object.entries(records).map(
      async ([teacherId, status]) => {
        const newRecord = this.repo.create({
          date,
          status: status as string,
          teacher: { id: parseInt(teacherId) } as any,
        });
        return this.repo.save(newRecord);
      },
    );

    const results = await Promise.all(savePromises);

    return {
      success: true,
      message: "Attendance recorded successfully!",
      count: results.length,
    };
  }
}
