// Response: What we safely send back (hiding the internal ID and password)
export interface LoginResponseDto {
  success: boolean;
  message?: string;
  token?: string;
  admin?: {
    email: string;
  };
}
// dtos/response/auth.ts  — add this
export interface ChangePasswordResponseDto {
  success: boolean;
  message: string;
}
export interface UpdateProfileResponseDto {
  success: boolean;
  message: string;
  admin?: {
    username: string;
    email: string;
    profile_image: string | null;
  };
}
