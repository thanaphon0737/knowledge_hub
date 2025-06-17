export interface DocumentResponseDto {
  id: string;
  user_id: string;
  name: string;
  description: string;
  created_at: Date;
  updated_at: Date;
}
export interface DocumentCreateDto {
  user_id: string;
  name: string;
  description: string;
}
export interface DocumentUpdateDto {
  id: string;
  user_id?: string;
  name?: string;
  description?: string;
}
export interface DocumentDeleteDto {
  id: string;
  user_id: string;
}
