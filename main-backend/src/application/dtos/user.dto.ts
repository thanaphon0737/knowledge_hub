// DTO สำหรับส่งข้อมูล User กลับไปให้ Client
export interface UserResponseDto {
  id: string;
  email: string;
  created_at: Date;
}