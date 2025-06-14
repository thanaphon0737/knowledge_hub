// src/application/use-cases/documents/__tests__/CreateDocument.usecase.spec.ts

import { CreateDocumentUseCase } from '../CreateDocument.usecase';
import { IDocumentRepository } from '../../../repositories/IDocumentRepository';
import { Document } from '../../../../domain/entities/document.entity';

// --- Mocking External Libraries ---
// We mock uuid to ensure our test produces a predictable, consistent ID.
jest.mock('uuid', () => ({
  v4: jest.fn().mockReturnValue('a-unique-document-id'),
}));

// 'describe' groups together all tests for the "CreateDocumentUseCase" feature.
describe('CreateDocumentUseCase', () => {

  // Declare a variable for our mock repository.
  let mockDocumentRepository: jest.Mocked<IDocumentRepository>;

  // 'beforeEach' runs before every single test ('it' block).
  // This ensures each test starts with a fresh mock repository.
  beforeEach(() => {
    mockDocumentRepository = {
      create: jest.fn(),
      // Add other methods from the interface as jest.fn() if needed for other tests
      update: jest.fn(),
      findByIdAndUserId: jest.fn(),
      findAllByUserId: jest.fn(),
      deleteByIdAndUserId: jest.fn(),
    };
  });

  // --- Test Case 1: The Happy Path (Successful Creation) ---
  it('should create a new document successfully when a valid name and userId are provided', async () => {
    // --- Arrange ---
    // Setup the scenario. We define what the mock repository should return when 'create' is called.
    // In this case, it will return the document object it received.
    mockDocumentRepository.create.mockImplementation((docInput) => {
      const fullDocument: Document = {
        id: 'a-unique-document-id', // from our mock
        ...docInput,
        created_at: new Date(),
        updated_at: new Date(),
      };
      return Promise.resolve(fullDocument);
    });

    // Instantiate the use case with our mock repository.
    const createDocumentUseCase = new CreateDocumentUseCase(mockDocumentRepository);

    // --- Act ---
    // Execute the use case with test data.
    const result = await createDocumentUseCase.execute(
      'user-123','My First Research Project',
      'A project about AI trends.',
      
    );

    // --- Assert ---
    // Check if the outcome is what we expected.
    expect(result).toBeDefined();
    expect(result.id).toBe('a-unique-document-id');
    expect(result.name).toBe('My First Research Project');
    expect(result.user_id).toBe('user-123');
    expect(mockDocumentRepository.create).toHaveBeenCalledTimes(1); // Ensure the create method was called.
    expect(mockDocumentRepository.create).toHaveBeenCalledWith({ // Ensure it was called with the correct data.
      name: 'My First Research Project',
      description: 'A project about AI trends.',
      user_id: 'user-123'
    });
  });

  // --- Test Case 2: Input Validation Failure ---
  it('should throw an error if the document name is not provided (empty string)', async () => {
    // --- Arrange ---
    const createDocumentUseCase = new CreateDocumentUseCase(mockDocumentRepository);

    // --- Act & Assert ---
    // We expect the execution to fail and throw a specific error.
    await expect(
      createDocumentUseCase.execute(
        '', // Invalid name
        '',
       'user-123'
      )
    ).rejects.toThrow('Document name cannot be empty');

    // We also assert that the repository's 'create' method was never called,
    // because the validation should fail before any database interaction.
    expect(mockDocumentRepository.create).not.toHaveBeenCalled();
  });

});

/*
  *** Important Note ***
  For these tests to pass, you must add validation logic
  to your CreateDocument.usecase.ts file like this:

  // src/application/use-cases/documents/CreateDocument.usecase.ts
  async execute(input: { name: string; description?: string; userId: string; }): Promise<Document> {
    // 1. Input Validation
    if (!input.name || input.name.trim() === '') {
      throw new Error('Document name cannot be empty');
    }

    // 2. Business Logic (the rest of your code)
    const newDocumentData = {
      name: input.name,
      description: input.description,
      user_id: input.userId,
    };
    
    return this.documentRepository.create(newDocumentData);
  }
*/
