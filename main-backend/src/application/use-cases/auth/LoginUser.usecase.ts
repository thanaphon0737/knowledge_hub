import { User } from "../../../domain/entities/user.entity";
import { IUserRepository } from "../../repositories/IUserRepository";
import * as jwt from "jsonwebtoken";
import * as bcrypt from "bcrypt";

export class LoginUserUseCase {
  private userRepository: IUserRepository;

  constructor(userRepository: IUserRepository) {
    this.userRepository = userRepository;
  }

  async execute(email: string, password: string): Promise<String> {
    // 1. Input Validation
    if (!email || !password) {
      throw new Error("Email and password are required");
    }

    // 2. ค้นหาผู้ใช้ด้วยอีเมล
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new Error("User not found");
    }

    // 3. ตรวจสอบรหัสผ่าน
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error("JWT_SECRET is not defined in .env file");
    }
    if (!isPasswordValid) {
      throw new Error("Invalid email or password");
    }
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || "default_secret",
      { expiresIn: "1h" } // กำหนดเวลาในการหมดอายุของ Token   )
    );

    
    
    return token;
  }
}
