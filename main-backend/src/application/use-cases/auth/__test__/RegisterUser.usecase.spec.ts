// src/application/use-cases/auth/__tests__/RegisterUser.usecase.spec.ts

import { RegisterUserUseCase } from '../RegisterUser.usecase';
import { IUserRepository } from '../../../repositories/IUserRepository';
import { User } from '../../../../domain/entities/user.entity';

// --- Mocking External Libraries ---
// เราจำลองการทำงานของ library ภายนอกเพื่อแยกการทดสอบให้อยู่แค่ใน Use Case ของเรา
// ทำให้เทสทำงานเร็วและคาดเดาผลลัพธ์ได้
jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('a_securely_hashed_password'),
}));
jest.mock('uuid', () => ({
  v4: jest.fn().mockReturnValue('a_unique_user_id'),
}));

// 'describe' คือการจัดกลุ่มของ Test Case สำหรับฟีเจอร์ "RegisterUserUseCase"
describe('RegisterUserUseCase', () => {

  // ประกาศตัวแปรสำหรับเก็บ "Repository ปลอม" ของเรา
  let mockUserRepository: jest.Mocked<IUserRepository>;

  // 'beforeEach' จะทำงานก่อนทุกๆ test case (ก่อนทุก 'it' block)
  // เพื่อให้แน่ใจว่าทุกการทดสอบจะเริ่มต้นด้วย mock ที่สดใหม่เสมอ
  beforeEach(() => {
    mockUserRepository = {
      findByEmail: jest.fn(),
      findById: jest.fn(),
      save: jest.fn(),
    };
  });

  // --- Test Case กลุ่มที่ 1: Happy Path (กรณีที่ทำงานสำเร็จ) ---
  it('should create a new user successfully when provided with valid data', async () => {
    // Arrange: จัดเตรียมสถานการณ์
    mockUserRepository.findByEmail.mockResolvedValue(null); // จำลองว่าอีเมลนี้ยังไม่เคยมีในระบบ
    mockUserRepository.save.mockImplementation((user: User) => Promise.resolve(user)); // จำลองว่าการบันทึกสำเร็จ

    const registerUseCase = new RegisterUserUseCase(mockUserRepository);

    // Act: เรียกใช้งานฟังก์ชันที่ต้องการทดสอบ
    const result = await registerUseCase.execute('new_user@example.com', 'ValidPassword123');

    // Assert: ตรวจสอบผลลัพธ์ที่ได้
    expect(result).toBeDefined();
    expect(result.email).toBe('new_user@example.com');
    expect(mockUserRepository.findByEmail).toHaveBeenCalledWith('new_user@example.com');
    expect(mockUserRepository.save).toHaveBeenCalledTimes(1);
  });

  // --- Test Case กลุ่มที่ 2: Business Logic Failure (กรณีที่ล้มเหลวตามกฎของระบบ) ---
  it('should throw an error if the email already exists', async () => {
    // Arrange: จัดเตรียมสถานการณ์ว่าอีเมลนี้มีอยู่แล้ว
    mockUserRepository.findByEmail.mockResolvedValue({
      id: 'existing-id', email: 'existing@example.com', password_hash: 'some_hash',
      created_at: new Date(), updated_at: new Date(),
    });

    const registerUseCase = new RegisterUserUseCase(mockUserRepository);

    // Act & Assert: คาดหวังว่าการทำงานจะโยน Error ออกมา
    await expect(
      registerUseCase.execute('existing@example.com', 'any_password')
    ).rejects.toThrow('Email already in use');

    // ตรวจสอบว่าไม่ได้มีการเรียกใช้ฟังก์ชัน save เลย
    expect(mockUserRepository.save).not.toHaveBeenCalled();
  });

  // --- Test Case กลุ่มที่ 3: Input Validation Failure (กรณีที่ข้อมูลที่ส่งเข้ามาไม่ถูกต้อง) ---
  it('should throw an error if the password is shorter than 8 characters', async () => {
    // Arrange
    const registerUseCase = new RegisterUserUseCase(mockUserRepository);

    // Act & Assert
    await expect(
      registerUseCase.execute('any_user@example.com', 'short')
    ).rejects.toThrow('Password must be at least 8 characters long');

    // ตรวจสอบให้แน่ใจว่าไม่มีการติดต่อกับฐานข้อมูลเลย
    expect(mockUserRepository.findByEmail).not.toHaveBeenCalled();
    expect(mockUserRepository.save).not.toHaveBeenCalled();
  });

  it('should throw an error for an invalid email format', async () => {
    // Arrange
    const registerUseCase = new RegisterUserUseCase(mockUserRepository);

    // Act & Assert
    await expect(
      registerUseCase.execute('invalid-email', 'ValidPassword123')
    ).rejects.toThrow('Invalid email format');
    
    expect(mockUserRepository.findByEmail).not.toHaveBeenCalled();
  });
  
  it('should throw an error if the email is not provided (empty string)', async () => {
    // Arrange
    const registerUseCase = new RegisterUserUseCase(mockUserRepository);

    // Act & Assert
    await expect(
      registerUseCase.execute('', 'ValidPassword123')
    ).rejects.toThrow('Email is required');
  });
  
  it('should throw an error if the password is not provided (empty string)', async () => {
    // Arrange
    const registerUseCase = new RegisterUserUseCase(mockUserRepository);

    // Act & Assert
    await expect(
      registerUseCase.execute('test@example.com', '')
    ).rejects.toThrow('Password must be at least 8 characters long');
  });
});


/*
  *** หมายเหตุสำคัญ ***
  เพื่อให้ Test Case ทั้งหมดนี้ทำงานผ่าน คุณจะต้องเพิ่มโค้ด Validation
  เข้าไปในไฟล์ RegisterUser.usecase.ts ของคุณดังนี้:

  // src/application/use-cases/auth/RegisterUser.usecase.ts
  async execute(email: string, password: string): Promise<User> {
    // 1. Input Validation
    if (!email) {
      throw new Error('Email is required');
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Invalid email format');
    }
    if (!password || password.length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }

    // 2. Business Logic (โค้ดเดิมของคุณ)
    const existingUser = await this.userRepository.findByEmail(email);
    // ...
  }
*/
