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
        const id = parseInt(teacherId);

        // ✅ Check for an existing record for this teacher on this date
        const existing = await this.repo.findOne({
          where: {
            date,
            teacher: { id },
          },
        });

        if (existing) {
          // ✅ UPDATE the existing record instead of creating a duplicate
          existing.status = status as string;
          existing.checkInMethod = "MANUAL";
          return this.repo.save(existing);
        }

        // ✅ CREATE a new record if none exists
        const newRecord = this.repo.create({
          date,
          status: status as string,
          checkInMethod: "MANUAL",
          teacher: { id } as any,
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
