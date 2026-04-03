import { AppDataSource } from "../config/db";
import { Teacher } from "../entities/teachers";
import { Attendance } from "../entities/attendance";

export class DashboardService {
  private teacherRepo = AppDataSource.getRepository(Teacher);
  private attendanceRepo = AppDataSource.getRepository(Attendance);

  async getStats() {
    try {
      // 1. Get Today's Date String (YYYY-MM-DD)
      const today = new Date();
      const todayDate = today.toISOString().split('T')[0];

      // 2. Calculate Yesterday's Date String (YYYY-MM-DD)
      const yesterday = new Date();
      yesterday.setDate(today.getDate() - 1);
      const yesterdayDate = yesterday.toISOString().split('T')[0];

      const totalTeachers = await this.teacherRepo.count();

      // --- COUNTS (Still for Today) ---
      const presentToday = await this.attendanceRepo.createQueryBuilder("attendance")
        .select("COUNT(DISTINCT attendance.teacherId)", "count")
        .where("attendance.status = :status", { status: "present" })
        .andWhere("attendance.date = :today", { today: todayDate })
        .getRawOne();

      const absentToday = await this.attendanceRepo.createQueryBuilder("attendance")
        .select("COUNT(DISTINCT attendance.teacherId)", "count")
        .where("attendance.status = :status", { status: "absent" })
        .andWhere("attendance.date = :today", { today: todayDate })
        .getRawOne();

      const permissionToday = await this.attendanceRepo.createQueryBuilder("attendance")
        .select("COUNT(DISTINCT attendance.teacherId)", "count")
        .where("attendance.status = :status", { status: "permission" })
        .andWhere("attendance.date = :today", { today: todayDate })
        .getRawOne();

      // --- TABLE RECORDS (Filter specifically for Yesterday) ---
      const yesterdayRecordsRaw = await this.attendanceRepo.find({
        where: { date: yesterdayDate }, // This filters for Apr 2
        relations: ["teacher"],
        order: { createdAt: "DESC" }, 
      });

      return {
        totalTeachers,
        presentToday: parseInt(presentToday.count) || 0,
        absentToday: parseInt(absentToday.count) || 0,
        permissionToday: parseInt(permissionToday.count) || 0,
        records: yesterdayRecordsRaw.map(r => ({
          name: r.teacher?.name || "Unknown",
          status: r.status,
          // Extract time from createdAt
          time: new Date(r.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          // Show "Apr 2" or "Yesterday"
          date: new Date(r.date).toLocaleDateString([], { month: 'short', day: 'numeric' })
        }))
      };
    } catch (error) {
      console.error("Dashboard Service Error:", error);
      throw error;
    }
  }
}