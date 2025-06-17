import { GetDocumentByIdUseCase } from '../GetDocumentById.usecase';
import { IDocumentRepository } from '../../../repositories/IDocumentRepository';
import { Document } from '../../../../domain/entities/document.entity';

describe('GetDocumentByIdUseCase', () => {
  let mockDocumentRepository: jest.Mocked<IDocumentRepository>;
  let getDocumentByIdUseCase: GetDocumentByIdUseCase;

  beforeEach(() => {
    mockDocumentRepository = {
      findByIdAndUserId: jest.fn(),
      findAllByUserId: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      deleteByIdAndUserId: jest.fn(),
    };
    getDocumentByIdUseCase = new GetDocumentByIdUseCase(mockDocumentRepository);
  });

  it('should return a document when it exists and belongs to the user', async () => {
    // Arrange
    const mockDocument: Document = {
      id: 'doc-123',
      user_id: 'user-456',
      name: 'Test Document',
      description: 'Test Description',
      created_at: new Date(),
      updated_at: new Date(),
    };
    mockDocumentRepository.findByIdAndUserId.mockResolvedValue(mockDocument);

    // Act
    const result = await getDocumentByIdUseCase.execute('user-456', 'doc-123');

    // Assert
    expect(result).toBeDefined();
    expect(result).toEqual(mockDocument);
    expect(mockDocumentRepository.findByIdAndUserId).toHaveBeenCalledWith('doc-123', 'user-456');
    expect(mockDocumentRepository.findByIdAndUserId).toHaveBeenCalledTimes(1);
  });

  it('should throw error when document is not found', async () => {
    // Arrange
    mockDocumentRepository.findByIdAndUserId.mockResolvedValue(null);

    // Act & Assert
    await expect(getDocumentByIdUseCase.execute('user-456', 'non-existent-doc'))
      .rejects
      .toThrow('Document not found or user does not have permission');
  });
});