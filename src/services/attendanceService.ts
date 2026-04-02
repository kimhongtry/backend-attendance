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
      const tId = parseInt(teacherId);

      // 1. Look for an existing record for THIS teacher on THIS date
      let existingRecord = await this.repo.findOne({
        where: {
          date: date,
          teacher: { id: tId }
        }
      });

      if (existingRecord) {
        // 2. If it exists, UPDATE the status (e.g., change 'present' to 'absent')
        existingRecord.status = status as string;
        return this.repo.save(existingRecord);
      } else {
        // 3. If it doesn't exist, CREATE a new one
        const newRecord = this.repo.create({
          date,
          status: status as string,
          teacher: { id: tId } as any,
        });
        return this.repo.save(newRecord);
      }
    },
  );

  const results = await Promise.all(savePromises);

  return {
    success: true,
    message: "Attendance updated successfully!",
    count: results.length,
  };
}
}
