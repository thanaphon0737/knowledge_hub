// src/application/use-cases/auth/__tests__/LoginUser.usecase.spec.ts

import { LoginUserUseCase } from '../LoginUser.usecase';
import { IUserRepository } from '../../../repositories/IUserRepository';
import { User } from '../../../../domain/entities/user.entity';

// --- Mocking External Libraries ---
// เราจำลองการทำงานของ library ภายนอกเพื่อแยกการทดสอบให้อยู่แค่ใน Use Case ของเรา
jest.mock('bcrypt', () => ({
  // จำลองว่าฟังก์ชัน compare จะคืนค่าเป็น true (รหัสผ่านถูกต้อง) โดยดีฟอลต์
  // เราสามารถเปลี่ยนค่านี้ในแต่ละ Test Case ได้
  compare: jest.fn().mockResolvedValue(true), 
}));

jest.mock('jsonwebtoken', () => ({
  // จำลองว่าฟังก์ชัน sign จะคืนค่าเป็น token ที่เรากำหนด
  sign: jest.fn().mockReturnValue('a_valid_jwt_token'),
}));

// 'describe' คือการจัดกลุ่มของ Test Case สำหรับฟีเจอร์ "LoginUserUseCase"
describe('LoginUserUseCase', () => {
  
  let mockUserRepository: jest.Mocked<IUserRepository>;
  let loginUseCase: LoginUserUseCase;

  // beforeEach จะทำงานก่อนทุกๆ Test Case เพื่อให้ทุกการทดสอบเริ่มต้นด้วย mock ที่สดใหม่
  beforeEach(() => {
    // สร้าง "Repository ปลอม"
    mockUserRepository = {
      findByEmail: jest.fn(),
      findById: jest.fn(),
      save: jest.fn(), // แม้จะไม่ได้ใช้ใน login แต่ IUserRepository กำหนดไว้ เราจึงต้องมี
    };
    // สร้าง instance ของ use case โดย "ฉีด" repository ปลอมเข้าไป
    loginUseCase = new LoginUserUseCase(mockUserRepository);
    
    // ตั้งค่า JWT_SECRET สำหรับการทดสอบ
    process.env.JWT_SECRET = 'test_secret';
  });

  // --- Test Case 1: Happy Path (กรณีที่ทำงานสำเร็จ) ---
  it('should return a JWT token for a user with correct credentials', async () => {
    // Arrange: จัดเตรียมสถานการณ์
    const existingUser: User = {
      id: 'user-123',
      email: 'test@example.com',
      password_hash: 'hashed_password_from_db',
      created_at: new Date(),
      updated_at: new Date(),
    };
    mockUserRepository.findByEmail.mockResolvedValue(existingUser); // จำลองว่าหา user เจอ
    // bcrypt.compare จะคืนค่า true ตามที่ mock ไว้ด้านบน

    // Act: เรียกใช้งานฟังก์ชันที่ต้องการทดสอบ
    const {token} = await loginUseCase.execute('test@example.com', 'correct_password');

    // Assert: ตรวจสอบผลลัพธ์
    expect(token).toBe('a_valid_jwt_token'); // Token ที่ได้ต้องตรงกับที่ mock ไว้
    expect(mockUserRepository.findByEmail).toHaveBeenCalledWith('test@example.com'); // ตรวจสอบว่ามีการเรียกหา user
    expect(require('bcrypt').compare).toHaveBeenCalledWith('correct_password', 'hashed_password_from_db'); // ตรวจสอบว่ามีการเทียบรหัสผ่าน
    expect(require('jsonwebtoken').sign).toHaveBeenCalled(); // ตรวจสอบว่ามีการสร้าง token
  });

  // --- Test Case 2: Failure Path (กรณีรหัสผ่านผิด) ---
  it('should throw an error if the password does not match', async () => {
    // Arrange
    const existingUser: User = {
      id: 'user-123',
      email: 'test@example.com',
      password_hash: 'hashed_password_from_db',
      created_at: new Date(),
      updated_at: new Date(),
    };
    mockUserRepository.findByEmail.mockResolvedValue(existingUser); // จำลองว่าหา user เจอ
    (require('bcrypt').compare as jest.Mock).mockResolvedValue(false); // **สำคัญ:** Override mock ให้คืนค่า false สำหรับเทสนี้โดยเฉพาะ

    // Act & Assert: คาดหวังว่าการทำงานจะโยน Error
    await expect(
      loginUseCase.execute('test@example.com', 'wrong_password')
    ).rejects.toThrow('Invalid email or password');
  });

  // --- Test Case 3: Failure Path (กรณีไม่พบผู้ใช้) ---
  it('should throw an error if the user with the given email does not exist', async () => {
    // Arrange
    mockUserRepository.findByEmail.mockResolvedValue(null); // จำลองว่าหา user ไม่เจอ

    // Act & Assert
    await expect(
      loginUseCase.execute('nonexistent@example.com', 'any_password')
    ).rejects.toThrow('User not found');
  });
  
  // --- Test Case 4: Failure Path (กรณี Server ตั้งค่าไม่ถูกต้อง) ---
  it('should throw an error if JWT_SECRET is not defined', async () => {
    // Arrange
    process.env.JWT_SECRET = ''; // จำลองสถานการณ์ที่ลืมตั้งค่า JWT_SECRET

    const existingUser: User = {
      id: 'user-123',
      email: 'test@example.com',
      password_hash: 'hashed_password_from_db',
      created_at: new Date(),
      updated_at: new Date(),
    };
    mockUserRepository.findByEmail.mockResolvedValue(existingUser);

    // Act & Assert
    await expect(
      loginUseCase.execute('test@example.com', 'correct_password')
    ).rejects.toThrow('JWT_SECRET is not defined in .env file');
  });

});
