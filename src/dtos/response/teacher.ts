// --- RESPONSE DTOs (Output to Frontend) ---
export interface TeacherResponseDto {
  id: number;
  staffId: string;
  name: string;
  subject: string;
  room: string;
}

export interface TeacherListResponseDto {
  success: boolean;
  teachers: TeacherResponseDto[];
}
