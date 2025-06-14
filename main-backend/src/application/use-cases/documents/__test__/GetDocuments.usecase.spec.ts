import { GetDocumentByIdUseCase } from '../GetDocumentById.usecase';

import { IDocumentRepository } from '../../../repositories/IDocumentRepository';
import { Document } from '../../../../domain/entities/document.entity';

describe('GetDocumentByIdUseCase', () => {
  let mockDocumentRepository: jest.Mocked<IDocumentRepository>;
  let getDocumentByIdUseCase: GetDocumentByIdUseCase;

  beforeEach(() => {
    mockDocumentRepository = {
        create: jest.fn(),
        update: jest.fn(),
        findByIdAndUserId: jest.fn(),
        findAllByUserId: jest.fn(),
        deleteByIdAndUserId: jest.fn(),
    };
    getDocumentByIdUseCase = new GetDocumentByIdUseCase(mockDocumentRepository);
  });

  // Test Case 1: Happy Path - Document found and user is the owner
  it('should return the document if it exists and belongs to the user', async () => {
    // Arrange: Simulate the repository finding the correct document.
    const fakeDocument: Document = {
      id: 'doc-abc-123',
      name: 'My Secret Document',
      user_id: 'user-xyz-789',
    } as Document;
    mockDocumentRepository.findByIdAndUserId.mockResolvedValue(fakeDocument);

    const input = { documentId: 'doc-abc-123', userId: 'user-xyz-789' };

    // Act
    const result = await getDocumentByIdUseCase.execute(input.userId, input.documentId);

    // Assert
    expect(result).toBeDefined();
    // Use non-null assertion `!` as we expect a result here.
    expect(result!.id).toBe('doc-abc-123');
    expect(result!.name).toBe('My Secret Document');
    expect(mockDocumentRepository.findByIdAndUserId).toHaveBeenCalledWith(input.documentId, input.userId);
  });

  // Test Case 2: Failure Path - Document not found or does not belong to the user
  it('should throw an error if the document is not found or does not belong to the user', async () => {
    // Arrange: Simulate the repository not finding any document for that user/id combination.
    mockDocumentRepository.findByIdAndUserId.mockResolvedValue(null);
    
    const input = { documentId: 'doc-of-someone-else', userId: 'user-xyz-789' };

    // Act & Assert
    await expect(
      getDocumentByIdUseCase.execute(input.userId, input.documentId)
    ).rejects.toThrow('Document not found or user does not have permission');
    
    expect(mockDocumentRepository.findByIdAndUserId).toHaveBeenCalledWith(input.documentId, input.userId);
  });
});