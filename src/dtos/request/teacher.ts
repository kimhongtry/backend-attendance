// --- REQUEST DTOs (Input from Frontend) ---
export interface CreateTeacherRequestDto {
  staffId: string;
  name: string;
  subject: string;
  room: string;
}

export interface UpdateTeacherRequestDto {
  name?: string;
  subject?: string;
  room?: string;
}
