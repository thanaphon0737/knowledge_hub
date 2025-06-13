export interface User {
  id: string; // 
  email: string;
  password_hash: string; // 
  token?: string; // ใช้สำหรับ JWT Token
  created_at: Date;
  updated_at: Date;
}