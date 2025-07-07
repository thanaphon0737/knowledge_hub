import { Request, Response, RequestHandler } from "express";
import { CookieOptions } from "express";
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
    const { user, token } = await registerUserUseCase.execute(email, password);
    //adding set for set cookie
    const cookieOptions: CookieOptions = {
      httpOnly: true,
      maxAge: 3600000, // 1 hour
    };

    if (process.env.NODE_ENV === "production") {
      cookieOptions.secure = true;
      cookieOptions.sameSite = "strict"; // Or 'lax' depending on your needs
      // You might also need to set the domain explicitly for your production site
      // cookieOptions.domain = 'your-production-domain.com';
    } else {
      // For development (including tunnels), we need a more relaxed policy.
      cookieOptions.secure = false; // Because dev tunnels are often not HTTPS locally
      cookieOptions.sameSite = "lax"; // 'lax' is required for cross-domain cookies to be sent
    }
    // --- Set the cookie with the dynamic options ---
    res.cookie("access_token", token, cookieOptions);
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
    const token = await loginUserUseCase.execute(email, password);
    if (!token) {
      res.status(401).json({ success: false, message: "Invalid credentials" });
      return;
    }
    const cookieOptions: CookieOptions = {
      httpOnly: true,
      maxAge: 3600000, // 1 hour
    };

    if (process.env.NODE_ENV === "production") {
      cookieOptions.secure = true;
      cookieOptions.sameSite = "none"; // Or 'lax' depending on your needs
      // You might also need to set the domain explicitly for your production site
      // cookieOptions.domain = 'your-production-domain.com';
    } else {
      // For development (including tunnels), we need a more relaxed policy.
      cookieOptions.secure = false; // Because dev tunnels are often not HTTPS locally
      cookieOptions.sameSite = "lax"; // 'lax' is required for cross-domain cookies to be sent
    }
    // --- Set the cookie with the dynamic options ---
    res.cookie("access_token", token, cookieOptions);

    // ส่ง Token กลับไป
    res.status(200).json({ success: true, token });
  } catch (error: any) {
    // จัดการ Error ที่อาจจะถูกโยนมาจาก Use Case (เช่น อีเมลไม่ถูกต้องหรือรหัสผ่านไม่ถูกต้อง)
    res.status(400).json({ success: false, message: error.message });
  }
};
