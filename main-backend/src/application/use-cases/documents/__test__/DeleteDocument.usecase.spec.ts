import { DeleteDocumentByIdUseCase } from '../DeleteDocument.usecase';
import { IDocumentRepository } from '../../../repositories/IDocumentRepository';

describe('DeleteDocumentByIdUseCase', () => {
  let mockDocumentRepository: jest.Mocked<IDocumentRepository>;
  let deleteDocumentUseCase: DeleteDocumentByIdUseCase;

  beforeEach(() => {
    mockDocumentRepository = {
      deleteByIdAndUserId: jest.fn(),
      findByIdAndUserId: jest.fn(),
      findAllByUserId: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    };
    deleteDocumentUseCase = new DeleteDocumentByIdUseCase(mockDocumentRepository);
  });

  it('should successfully delete a document with valid input', async () => {
    // Arrange
    mockDocumentRepository.deleteByIdAndUserId.mockResolvedValue(undefined);

    // Act
    await deleteDocumentUseCase.execute('doc-123', 'user-456');

    // Assert
    expect(mockDocumentRepository.deleteByIdAndUserId).toHaveBeenCalledWith('doc-123', 'user-456');
    expect(mockDocumentRepository.deleteByIdAndUserId).toHaveBeenCalledTimes(1);
  });

  it('should throw error when document ID is missing', async () => {
    // Act & Assert
    await expect(deleteDocumentUseCase.execute('', 'user-456'))
      .rejects
      .toThrow('Document ID and User ID are required');
  });

  it('should throw error when user ID is missing', async () => {
    // Act & Assert
    await expect(deleteDocumentUseCase.execute('doc-123', ''))
      .rejects
      .toThrow('Document ID and User ID are required');
  });

  it('should handle repository errors properly', async () => {
    // Arrange
    mockDocumentRepository.deleteByIdAndUserId.mockRejectedValue(new Error('Database error'));

    // Act & Assert
    await expect(deleteDocumentUseCase.execute('doc-123', 'user-456'))
      .rejects
      .toThrow('Database error');
  });
});