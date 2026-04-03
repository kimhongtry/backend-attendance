import { AppDataSource } from "../config/db";
import { Teacher } from "../entities/teachers";
import { Attendance } from "../entities/attendance";

export class DashboardService {
  private teacherRepo = AppDataSource.getRepository(Teacher);
  private attendanceRepo = AppDataSource.getRepository(Attendance);

  async getStats() {
    try {
      const teacherRepo = AppDataSource.getRepository(Teacher);
      const attendanceRepo = AppDataSource.getRepository(Attendance);

      const totalTeachers = await teacherRepo.count();
      const todayDate = new Date().toISOString().split('T')[0];
      const todayDateString = new Date().toLocaleDateString('en-CA');

      // 1. FIXED: Only count UNIQUE teachers marked "present" today
const presentToday = await this.attendanceRepo.createQueryBuilder("attendance")
    .select("COUNT(DISTINCT attendance.teacherId)", "count")
    .where("attendance.status = :status", { status: "present" })
    .andWhere("attendance.date = :today", { today: todayDate }) // Use exact match '=' instead of LIKE
    .getRawOne();

// Absent Today
const absentToday = await this.attendanceRepo.createQueryBuilder("attendance")
    .select("COUNT(DISTINCT attendance.teacherId)", "count")
    .where("attendance.status = :status", { status: "absent" })
    .andWhere("attendance.date = :today", { today: todayDate })
    .getRawOne();
      // 3. FIXED: Only count UNIQUE teachers marked "permission" today
      const permissionToday = await attendanceRepo.createQueryBuilder("attendance")
        .select("COUNT(DISTINCT attendance.teacherId)", "count")
        .where("attendance.status = :status", { status: "permission" })
        .andWhere("attendance.date = :today", { today: todayDate })
        .getRawOne();

      const recentRaw = await attendanceRepo.find({
        relations: ["teacher"],
        order: { date: "DESC" },
        take: 5
      });

      return {
        totalTeachers,
        // We use parseInt because getRawOne returns a string
        presentToday: parseInt(presentToday.count),
        absentToday: parseInt(absentToday.count),
        permissionToday: parseInt(permissionToday.count),
        records: recentRaw.map(r => ({
          name: r.teacher?.name || "Unknown",
          status: r.status,
          time: new Date(r.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          date: new Date(r.date).toLocaleDateString([], { month: 'short', day: 'numeric' })
        }))
      };
    } catch (error) {
      console.error("Dashboard Service Error:", error);
      throw error;
    }
}
}