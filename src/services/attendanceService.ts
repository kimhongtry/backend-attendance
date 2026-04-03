import { AppDataSource } from "../config/db";
import { Attendance } from "../entities/attendance";
import { MarkAttendanceRequestDto } from "../dtos/request/attendance";
import { AttendanceResponseDto } from "../dtos/response/attendance";
import { Teacher } from "../entities/teachers";

export class AttendanceService {
  async getTodayAttendance() {
    const today = new Date().toISOString().split("T")[0];

    const records = await this.repo
      .createQueryBuilder("attendance")
      .leftJoinAndSelect("attendance.teacher", "teacher")
      .where("attendance.date = :today", { today })
      .getMany();

    return records.map((r) => ({
      teacherId: r.teacher.id,
      status: r.status,
      checkInMethod: r.checkInMethod,
    }));
  }
  private repo = AppDataSource.getRepository(Attendance);
  private teacherRepo = AppDataSource.getRepository(Teacher);

  async markTeachersAttendance(
  data: MarkAttendanceRequestDto,
): Promise<AttendanceResponseDto> {
  const { date, records } = data;

  if (!records || Object.keys(records).length === 0) {
    return {
      success: true,
      message: "No attendance records to process.",
      count: 0,
    };
  }

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
  // ─────────────────────────────────────────────
  // Daily report for a specific date
  // ─────────────────────────────────────────────
  async getDailyReport(date: string) {
    const totalTeachers = await this.teacherRepo.count();

    const records = await this.repo
      .createQueryBuilder("attendance")
      .leftJoinAndSelect("attendance.teacher", "teacher")
      .where("CAST(attendance.date AS DATE) = :date", { date })
      .orderBy("teacher.id", "ASC")
      .addOrderBy("attendance.id", "DESC") // ✅ latest record first
      .distinctOn(["teacher.id"]) // ✅ only one record per teacher
      .getMany();

    return {
      date,
      total: totalTeachers,
      records: records.map((r) => ({
        teacherId: r.teacher.id,
        teacherName: r.teacher.name,
        status: r.status,
        checkInMethod: r.checkInMethod,
      })),
    };
  }

  // ─────────────────────────────────────────────
  // Weekly report for a date range
  // ─────────────────────────────────────────────
  async getWeeklyReport(start: string, end: string) {
    const records = await this.repo
      .createQueryBuilder("attendance")
      .leftJoinAndSelect("attendance.teacher", "teacher")
      .where("attendance.date >= :start", { start })
      .andWhere("attendance.date <= :end", { end })
      .getMany();

    // Group by teacher and count statuses
    const map: Record<
      number,
      {
        teacherId: number;
        teacherName: string;
        present: number;
        absent: number;
        permission: number;
      }
    > = {};

    records.forEach((r) => {
      const id = r.teacher.id;
      if (!map[id]) {
        map[id] = {
          teacherId: id,
          teacherName: r.teacher.name,
          present: 0,
          absent: 0,
          permission: 0,
        };
      }
      if (r.status === "present") map[id].present++;
      else if (r.status === "absent") map[id].absent++;
      else if (r.status === "permission") map[id].permission++;
    });

    return {
      startDate: start,
      endDate: end,
      records: Object.values(map),
    };
  }
}
