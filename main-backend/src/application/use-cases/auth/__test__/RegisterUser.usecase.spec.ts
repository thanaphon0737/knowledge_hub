import { RegisterUserUseCase } from '../RegisterUser.usecase';
import { IUserRepository } from '../../../repositories/IUserRepository';
import { User } from '../../../../domain/entities/user.entity';

// Mock bcrypt and uuid libraries
// เราจะจำลองการทำงานของ library เหล่านี้เพื่อไม่ต้องเรียกใช้ของจริง
jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashed_password_string'),
}));
jest.mock('uuid', () => ({
  v4: jest.fn().mockReturnValue('a-unique-uuid'),
}));

// describe: เป็นการจัดกลุ่มของ Test Case สำหรับฟีเจอร์ "RegisterUserUseCase"
describe('RegisterUserUseCase', () => {

  let mockUserRepository: jest.Mocked<IUserRepository>;

  // beforeEach: จะรันก่อนทุกๆ test case (it block)
  beforeEach(() => {
    // 1. Arrange (จัดเตรียม): สร้าง "Repository ปลอม" (Mock)
    // เราสร้าง object ปลอมที่ทำหน้าตาเหมือน IUserRepository ทุกประการ
    // เพื่อให้เราสามารถควบคุมผลลัพธ์ของมันได้ในการทดสอบ
    mockUserRepository = {
      findByEmail: jest.fn(),
      save: jest.fn(),
    };
  });

  // Test Case 1: กรณีที่ลงทะเบียนสำเร็จ
  it('should create a new user successfully if email does not exist', async () => {
    // 1. Arrange (จัดเตรียม)
    // กำหนดให้ "Repository ปลอม" ของเรา เมื่อถูกเรียก findByEmail ให้ทำเป็นหาไม่เจอ (คืนค่า null)
    mockUserRepository.findByEmail.mockResolvedValue(null);
    // กำหนดให้ "Repository ปลอม" ของเรา เมื่อถูกเรียก save ให้คืนค่า user ที่ส่งเข้าไป
    mockUserRepository.save.mockImplementation((user: User) => Promise.resolve(user));
    
    // สร้าง instance ของ use case โดย "ฉีด" (inject) repository ปลอมของเราเข้าไป
    const registerUseCase = new RegisterUserUseCase(mockUserRepository);

    // 2. Act (เรียกใช้งาน)
    const result = await registerUseCase.execute('test@example.com', 'password123');

    // 3. Assert (ตรวจสอบผลลัพธ์)
    expect(result).toBeDefined(); // ผลลัพธ์ต้องไม่เป็น null
    expect(result.email).toBe('test@example.com'); // อีเมลต้องตรงกับที่ส่งเข้าไป
    expect(result.password_hash).toBe('hashed_password_string'); // รหัสผ่านต้องเป็นค่าที่ถูกเข้ารหัสแล้ว (จาก mock)
    expect(mockUserRepository.findByEmail).toHaveBeenCalledWith('test@example.com'); // ตรวจสอบว่ามีการเรียก findByEmail ด้วยอีเมลที่ถูกต้อง
    expect(mockUserRepository.save).toHaveBeenCalled(); // ตรวจสอบว่ามีการเรียก save
  });


  // Test Case 2: กรณีที่อีเมลซ้ำ
  it('should throw an error if the email already exists', async () => {
    // 1. Arrange (จัดเตรียม)
    // กำหนดให้ "Repository ปลอม" ของเรา เมื่อถูกเรียก findByEmail ให้ทำเป็นหา "เจอ"
    mockUserRepository.findByEmail.mockResolvedValue({
      id: 'existing-id',
      email: 'existing@example.com',
      password_hash: 'some_hash',
      created_at: new Date(),
      updated_at: new Date(),
    });

    const registerUseCase = new RegisterUserUseCase(mockUserRepository);

    // 2. Act & 3. Assert (เรียกใช้งานและตรวจสอบผลลัพธ์)
    // เราคาดหวังว่าการเรียก execute จะต้อง "โยน Error" ออกมา
    await expect(
      registerUseCase.execute('existing@example.com', 'password123')
    ).rejects.toThrow('Email already in use'); // และข้อความใน Error ต้องตรงกับที่เรากำหนดไว้
  });

});