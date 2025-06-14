import { GetDocuments } from '../GetDocuments.usecase';
import { IDocumentRepository } from '../../../repositories/IDocumentRepository';
import { Document } from '../../../../domain/entities/document.entity';

describe('GetDocuments UseCase', () => {
  let mockDocumentRepository: jest.Mocked<IDocumentRepository>;
  let getDocumentsUseCase: GetDocuments;

  beforeEach(() => {
    mockDocumentRepository = {
      create: jest.fn(),
      update: jest.fn(),
      findByIdAndUserId: jest.fn(),
      findAllByUserId: jest.fn(),
      deleteByIdAndUserId: jest.fn(),
    };
    getDocumentsUseCase = new GetDocuments(mockDocumentRepository);
  });

  // Test Case 1: Happy Path - User has documents
  it('should return an array of documents when documents are found for the user', async () => {
    // Arrange: Simulate the repository returning a list of documents.
    const fakeDocuments: Document[] = [
      { id: 'doc-1', name: 'Doc 1', user_id: 'user-with-docs' } as Document,
      { id: 'doc-2', name: 'Doc 2', user_id: 'user-with-docs' } as Document,
    ];
    mockDocumentRepository.findAllByUserId.mockResolvedValue(fakeDocuments);

    // Act
    const result = await getDocumentsUseCase.execute('user-with-docs');

    // Assert
    expect(result).toHaveLength(2);
    // Use non-null assertion `!` because we expect a result in this case.
    expect(result![0].name).toBe('Doc 1');
    expect(mockDocumentRepository.findAllByUserId).toHaveBeenCalledWith('user-with-docs');
  });

  // Test Case 2: Failure Path - User has no documents, should throw error as per the provided logic.
  it('should throw an error if no documents are found for the user', async () => {
    // Arrange: Simulate the repository returning an empty array.
    mockDocumentRepository.findAllByUserId.mockResolvedValue([]);

    // Act & Assert: We expect the execution to fail and throw a specific error.
    await expect(
        getDocumentsUseCase.execute('user-without-docs')
    ).rejects.toThrow('Document not found for the user');

    expect(mockDocumentRepository.findAllByUserId).toHaveBeenCalledWith('user-without-docs');
  });
});
