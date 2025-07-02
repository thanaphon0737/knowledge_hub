import { Request, Response, RequestHandler } from "express";
import { RegisterUserUseCase } from "../../../application/use-cases/auth/RegisterUser.usecase";
import { PostgresUserRepository } from "../../database/postgres/PostgresUserRepository";
import { UserResponseDto } from "../../../application/dtos/user.dto";
import { LoginUserUseCase } from "../../../application/use-cases/auth/LoginUser.usecase";
// -- สร้าง Instance ของ Repository --
// ในแอปพลิเคชันจริง ส่วนนี้ควรจะทำผ่าน Dependency Injection ที่ main.ts
const userRepository = new PostgresUserRepository();

export const register: RequestHandler = async (req, res) => {
  // ดึง email และ password จาก request body
  const { email, password } = req.body;

  // ตรวจสอบข้อมูลเบื้องต้น
  if (!email || !password) {
    res
      .status(400)
      .json({ success: false, message: "Email and password are required" });
    return;
  }

  try {
    // สร้างและเรียกใช้ RegisterUserUseCase
    const registerUserUseCase = new RegisterUserUseCase(userRepository);
    const {user,token} = await registerUserUseCase.execute(email, password);
    //adding set for set cookie
    res.cookie('access_token',token, {
      httpOnly:true,
      secure: false, // for dev
      sameSite: 'strict',
      maxAge: 60 *60*1000 // 1hr
    })
    // แปลงข้อมูล User เป็น DTO (Data Transfer Object) เพื่อส่งกลับ
    const userResponse: UserResponseDto = {
      id: user.id,
      email: user.email,
      created_at: user.created_at,
    };
    res.status(201).json({ success: true, data: userResponse });
  } catch (error: any) {
    // จัดการ Error ที่อาจจะถูกโยนมาจาก Use Case (เช่น อีเมลซ้ำ)
    res.status(400).json({ success: false, message: error.message });
  }
};

export const login: RequestHandler = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res
      .status(400)
      .json({ success: false, message: "Email and password are required" });
    return;
  }

  try {
    // สร้างและเรียกใช้ LoginUserUseCase
    const loginUserUseCase = new LoginUserUseCase(userRepository);
    const  token  = await loginUserUseCase.execute(email, password);
    if(!token) {
      res.status(401).json({ success: false, message: "Invalid credentials" });
        return;
    }
    res.cookie("access_token", token, {
      httpOnly: true, // ป้องกันการเข้าถึงจาก JavaScript
      // secure: process.env.NODE_ENV === "production", // ใช้ secure cookie ใน production
      secure: false,
      sameSite: "strict", // ป้องกัน CSRF
      maxAge: 3600000, // กำหนดอายุของ cookie เป็น 1 ชั่วโมง
    });
    
    // ส่ง Token กลับไป
    res.status(200).json({ success: true, token });
  } catch (error: any) {
    // จัดการ Error ที่อาจจะถูกโยนมาจาก Use Case (เช่น อีเมลไม่ถูกต้องหรือรหัสผ่านไม่ถูกต้อง)
    res.status(400).json({ success: false, message: error.message });
  }
};
