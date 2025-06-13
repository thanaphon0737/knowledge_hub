import { User } from "../../../domain/entities/user.entity";
import { IUserRepository } from "../../repositories/IUserRepository";

export class GetUserProfileUseCase {
  private userRepository: IUserRepository;

  constructor(userRepository: IUserRepository) {
    this.userRepository = userRepository;
  }

  async execute(userId: string): Promise<User> {
    // 1. Input Validation
    if (!userId) {
      throw new Error("User ID is required");
    }

    // 2. ค้นหาผู้ใช้ด้วย ID
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    // 3. ส่งข้อมูลผู้ใช้ที่พบ
    return user;
  }
}