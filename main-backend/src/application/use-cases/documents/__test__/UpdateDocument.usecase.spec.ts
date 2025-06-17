import { UpdateDocumentUseCase } from '../UpdateDocument.usecase';
import { IDocumentRepository } from '../../../repositories/IDocumentRepository';
import { Document } from '../../../../domain/entities/document.entity';

describe('UpdateDocumentUseCase', () => {
  let mockDocumentRepository: jest.Mocked<IDocumentRepository>;
  let updateDocumentUseCase: UpdateDocumentUseCase;

  beforeEach(() => {
    mockDocumentRepository = {
      update: jest.fn(),
      findByIdAndUserId: jest.fn(),
      findAllByUserId: jest.fn(),
      create: jest.fn(),
      deleteByIdAndUserId: jest.fn(),
    };
    updateDocumentUseCase = new UpdateDocumentUseCase(mockDocumentRepository);
  });

  it('should successfully update a document with valid input', async () => {
    // Arrange
    const updateData = {
      id: 'doc-123',
      user_id: 'user-456',
      name: 'Updated Document',
      description: 'Updated Description',
    };
    const updatedDocument: Document = {
      ...updateData,
      created_at: new Date(),
      updated_at: new Date(),
    };
    mockDocumentRepository.update.mockResolvedValue(updatedDocument);

    // Act
    const result = await updateDocumentUseCase.execute(updateData);

    // Assert
    expect(result).toEqual(updatedDocument);
    expect(mockDocumentRepository.update).toHaveBeenCalledWith(updateData);
    expect(mockDocumentRepository.update).toHaveBeenCalledTimes(1);
  });

  it('should throw error when document ID is missing', async () => {
    // Arrange
    const invalidData = {
      user_id: 'user-456',
      name: 'Updated Document',
    } as any;

    // Act & Assert
    await expect(updateDocumentUseCase.execute(invalidData))
      .rejects
      .toThrow('Document ID and User ID are required');
  });

  it('should throw error when user ID is missing', async () => {
    // Arrange
    const invalidData = {
      id: 'doc-123',
      name: 'Updated Document',
    } as any;

    // Act & Assert
    await expect(updateDocumentUseCase.execute(invalidData))
      .rejects
      .toThrow('Document ID and User ID are required');
  });

  it('should throw error when document is not found or user lacks permission', async () => {
    // Arrange
    const updateData = {
      id: 'doc-123',
      user_id: 'user-456',
      name: 'Updated Document',
    };
    mockDocumentRepository.update.mockResolvedValue(null);

    // Act & Assert
    await expect(updateDocumentUseCase.execute(updateData))
      .rejects
      .toThrow('Document not found or user does not have permission');
  });
});