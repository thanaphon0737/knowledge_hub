import { RequestHandler } from "express";
import { PostgresUserRepository } from "../../database/postgres/PostgresUserRepository";
import { GetUserProfileUseCase } from "../../../application/use-cases/user/GetUserProfile.usecase";
import { UserResponseDto } from "../../../application/dtos/user.dto";

// -- สร้าง Instance ของ Repository --
const userRepository = new PostgresUserRepository();

export const getUserProfile: RequestHandler = async (req, res) => {
  const userId = req.user?.id; // สมมติว่า req.user ถูกตั้งค่าโดย middleware ที่ตรวจสอบ JWT
  if (!userId) {
    res.status(401).json({ success: false, message: "Unauthorized" });
    return;
  }

  try {
    // สร้างและเรียกใช้ GetUserProfileUseCase
    const getUserProfileUseCase = new GetUserProfileUseCase(userRepository);
    const user = await getUserProfileUseCase.execute(userId);

    // แปลงข้อมูล User เป็น DTO (Data Transfer Object) เพื่อส่งกลับ
    const userResponse: UserResponseDto = {
      id: user.id,
      email: user.email,
      created_at: user.created_at,
    };
    res.status(200).json({ success: true, data: userResponse });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};