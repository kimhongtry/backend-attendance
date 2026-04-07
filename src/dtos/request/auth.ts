// Request: What the client MUST send
export interface LoginRequestDto {
  email: string;
  password: string;
}
// dtos/request/auth.ts  — add this
export interface ChangePasswordRequestDto {
  currentPassword: string;
  newPassword: string;
}
export interface UpdateProfileRequestDto {
  username?: string;
  email?: string;
}
