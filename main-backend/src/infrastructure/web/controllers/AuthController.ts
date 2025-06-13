import { Request, Response,RequestHandler } from 'express';
import { RegisterUserUseCase } from '../../../application/use-cases/auth/RegisterUser.usecase';
import { PostgresUserRepository } from '../../database/postgres/PostgresUserRepository';
// หมายเหตุ: LoginUserUseCase จะถูกสร้างในขั้นตอนต่อไป
// import { LoginUserUseCase } from '../../../application/use-cases/auth/LoginUser.usecase';

// -- สร้าง Instance ของ Repository --
// ในแอปพลิเคชันจริง ส่วนนี้ควรจะทำผ่าน Dependency Injection ที่ main.ts
const userRepository = new PostgresUserRepository();

export const register: RequestHandler = async (req, res) => {
    // ดึง email และ password จาก request body
    const { email, password } = req.body;

    // ตรวจสอบข้อมูลเบื้องต้น
    if (!email || !password) {
        res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    try {
        // สร้างและเรียกใช้ RegisterUserUseCase
        const registerUserUseCase = new RegisterUserUseCase(userRepository);
        const user = await registerUserUseCase.execute(email, password);
        
        // เราจะไม่ส่ง password hash กลับไป
        const { password_hash, ...userResponse } = user;

        res.status(201).json({ success: true, data: userResponse });

    } catch (error: any) {
        // จัดการ Error ที่อาจจะถูกโยนมาจาก Use Case (เช่น อีเมลซ้ำ)
        res.status(400).json({ success: false, message: error.message });
    }
};

// export const login = async (req: Request, res: Response) => {
//     // ส่วนของ Login จะถูกสร้างในฟีเจอร์ถัดไป
//     res.status(501).json({ success: false, message: 'Login feature not implemented yet.' });
// };