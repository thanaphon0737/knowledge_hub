// src/application/use-cases/auth/__tests__/RegisterUser.usecase.spec.ts

import { RegisterUserUseCase } from '../RegisterUser.usecase';
import { IUserRepository } from '../../../repositories/IUserRepository';
import { User } from '../../../../domain/entities/user.entity';

// We mock the external libraries to isolate our test to only the use case logic.
// This makes our tests fast and predictable.
jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('a_securely_hashed_password'),
}));
jest.mock('uuid', () => ({
  v4: jest.fn().mockReturnValue('a_unique_user_id'),
}));

// 'describe' groups together related tests for a specific feature.
describe('RegisterUserUseCase', () => {

  // This will be our "fake" user repository for testing purposes.
  let mockUserRepository: jest.Mocked<IUserRepository>;

  // 'beforeEach' is a Jest function that runs before every single test case ('it' block).
  // This ensures each test starts with a fresh, clean mock.
  beforeEach(() => {
    mockUserRepository = {
      findByEmail: jest.fn(),
      save: jest.fn(),
    };
  });

  // Test Case 1: The Happy Path
  it('should create a new user successfully when provided with valid data', async () => {
    // --- Arrange ---
    // We set up the scenario. In this case, the user does not exist yet.
    mockUserRepository.findByEmail.mockResolvedValue(null); // Simulate that the email is not found.
    mockUserRepository.save.mockImplementation((user: User) => Promise.resolve(user)); // Simulate that saving is successful.

    const registerUseCase = new RegisterUserUseCase(mockUserRepository);

    // --- Act ---
    // We execute the function we want to test.
    const result = await registerUseCase.execute('new_user@example.com', 'ValidPassword123');

    // --- Assert ---
    // We check if the outcome is what we expected.
    expect(result).toBeDefined();
    expect(result.email).toBe('new_user@example.com');
    expect(result.id).toBe('a_unique_user_id'); // From our uuid mock
    expect(result.password_hash).toBe('a_securely_hashed_password'); // From our bcrypt mock
    expect(mockUserRepository.findByEmail).toHaveBeenCalledWith('new_user@example.com'); // Was the check performed?
    expect(mockUserRepository.save).toHaveBeenCalledTimes(1); // Was the user saved?
  });

  // Test Case 2: Failure due to existing email
  it('should throw an "Email already in use" error if the email already exists', async () => {
    // --- Arrange ---
    // Simulate that the user repository finds an existing user with this email.
    mockUserRepository.findByEmail.mockResolvedValue({
      id: 'existing_id',
      email: 'existing@example.com',
      password_hash: 'some_hash',
      created_at: new Date(),
      updated_at: new Date(),
    });

    const registerUseCase = new RegisterUserUseCase(mockUserRepository);

    // --- Act & Assert ---
    // We expect this entire operation to fail (reject the promise) and throw a specific error.
    await expect(
      registerUseCase.execute('existing@example.com', 'any_password')
    ).rejects.toThrow('Email already in use');

    // We also assert that the 'save' function was never called, because the process should have stopped.
    expect(mockUserRepository.save).not.toHaveBeenCalled();
  });

  // Test Case 3: Failure due to business rule (e.g., short password)
  // This shows how to test business logic inside the use case itself.
  it('should throw an error if the password is too short (e.g., less than 8 characters)', async () => {
    // --- Arrange ---
    // We don't need to set up the mock repository here because the validation should fail before we even query the database.
    const registerUseCase = new RegisterUserUseCase(mockUserRepository);

    // --- Act & Assert ---
    await expect(
      registerUseCase.execute('any_user@example.com', 'short')
    ).rejects.toThrow('Password must be at least 8 characters long');
    
    // Ensure no database interaction occurred.
    expect(mockUserRepository.findByEmail).not.toHaveBeenCalled();
    expect(mockUserRepository.save).not.toHaveBeenCalled();
  });

});

// To make the test case #3 pass, you would need to add this validation
// at the beginning of your RegisterUser.usecase.ts `execute` method:
/*
  async execute(email: string, password: string): Promise<User> {
    if (password.length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }
    // ... rest of the logic
  }
*/
