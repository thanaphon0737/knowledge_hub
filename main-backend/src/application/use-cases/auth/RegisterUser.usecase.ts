// src/application/use-cases/auth/RegisterUser.usecase.ts

import { User } from "../../../domain/entities/user.entity";
import { IUserRepository } from "../../repositories/IUserRepository";
import * as bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import * as jwt from 'jsonwebtoken';
// คลาสนี้จะจัดการกับ Logic การลงทะเบียนผู้ใช้ทั้งหมด
export class RegisterUserUseCase {
  private userRepository: IUserRepository;

  // เราใช้ Dependency Injection โดยรับ IUserRepository เข้ามาใน constructor
  // เพื่อให้ Use Case นี้ไม่ยึดติดกับวิธีการเก็บข้อมูล (จะเก็บใน Postgres หรืออื่นๆ ก็ได้)
  constructor(userRepository: IUserRepository) {
    this.userRepository = userRepository;
  }

  // ฟังก์ชันหลักสำหรับทำงาน
  async execute(email: string, password: string): Promise<{ user: User; token: string }> {
    // 1. Input Validation
    if (!email) {
      throw new Error("Email is required");
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error("Invalid email format");
    }
    if (!password || password.length < 8) {
      throw new Error("Password must be at least 8 characters long");
    }
    // 1. ตรวจสอบว่ามีอีเมลนี้ในระบบแล้วหรือยัง
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      // ถ้ามีแล้ว ให้โยน Error เพื่อแจ้งว่าอีเมลซ้ำ
      throw new Error("Email already in use");
    }
    // 2. เข้ารหัสรหัสผ่านเพื่อความปลอดภัย
    // ตัวเลข 10 คือ "salt rounds" หรือความซับซ้อนในการเข้ารหัส
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. สร้าง User object ใหม่
    const newUser: User = {
      id: uuidv4(), // สร้าง ID ที่ไม่ซ้ำกัน
      email: email,
      password_hash: hashedPassword,
      created_at: new Date(),
      updated_at: new Date(),
    };

    // 4. บันทึก User ใหม่ลงในฐานข้อมูลผ่าน Repository
    const createdUser = await this.userRepository.save(newUser);
    //adding step for auto login
    const token = jwt.sign(
        { userId: createdUser.id, email: createdUser.email },
        process.env.JWT_SECRET!,
        { expiresIn: '1h' }
    );
    // 5. ส่งข้อมูล User ที่สร้างเสร็จแล้วกลับไป (โดยไม่มี password_hash)
    // ในสถานการณ์จริง เราอาจจะสร้าง DTO (Data Transfer Object) เพื่อไม่ให้ password_hash หลุดออกไป
    // แต่ในตัวอย่างนี้ เราจะส่งกลับไปทั้ง object ก่อน
    return { user: createdUser, token };
  }
}
