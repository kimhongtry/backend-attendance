// --- REQUEST DTO (Input) ---
export interface MarkAttendanceRequestDto {
  date: string; // YYYY-MM-DD
  records: Record<number, string>; // e.g., { "1": "present" }
}
