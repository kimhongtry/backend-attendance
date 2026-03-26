// types.ts or inside auth.ts
export interface AuthUser {
  id: number;
  role: string;
  iat?: number; // Issued at
  exp?: number; // Expiry
}
