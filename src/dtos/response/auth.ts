// Response: What we safely send back (hiding the internal ID and password)
export interface LoginResponseDto {
  success: boolean;
  message?: string;
  token?: string;
  admin?: {
    email: string;
  };
}
