/**
 * @fileoverview This file contains the Jest unit tests for the GetFileByDocumentIdUseCase.
 */

import { GetFileByDocumentIdUseCase } from '../GetFilesByDocumentId.usecase';
import { IFileRepository } from '../../../repositories/IFileRepository';
import { File } from '../../../../domain/entities/file.entity';
import { mock, MockProxy } from 'jest-mock-extended';

describe('GetFileByDocumentIdUseCase', () => {
    let fileRepository: MockProxy<IFileRepository>;
    let getFileByDocumentIdUseCase: GetFileByDocumentIdUseCase;
    const documentId = 'doc-xyz';
    const expectedFiles: File[] = [
        {
            id: 'file-1', document_id: documentId, source_type: 's3', file_name: 'a.pdf',
            source_location: 's3://bucket/a.pdf', file_size: 100, file_type: 'application/pdf',
            processing_status: 'done', created_at: new Date(), updated_at: new Date()
        },
        {
            id: 'file-2', document_id: documentId, source_type: 's3', file_name: 'b.png',
            source_location: 's3://bucket/b.png', file_size: 200, file_type: 'image/png',
            processing_status: 'done', created_at: new Date(), updated_at: new Date()
        },
    ];

    beforeEach(() => {
        fileRepository = mock<IFileRepository>();
        getFileByDocumentIdUseCase = new GetFileByDocumentIdUseCase(fileRepository);
    });

    //================================================================//
    //                          HAPPY PATH                            //
    //================================================================//

    it('should return an array of files for a valid document ID', async () => {
        // Arrange
        fileRepository.findByDocumentId.mockResolvedValue(expectedFiles);

        // Act
        const result = await getFileByDocumentIdUseCase.execute(documentId);

        // Assert
        expect(result).toEqual(expectedFiles);
        expect(result.length).toBe(2);
        expect(fileRepository.findByDocumentId).toHaveBeenCalledWith(documentId);
        expect(fileRepository.findByDocumentId).toHaveBeenCalledTimes(1);
    });

    it('should return an empty array if no files are found', async () => {
        // Arrange
        fileRepository.findByDocumentId.mockResolvedValue([]);
        
        // Act
        const result = await getFileByDocumentIdUseCase.execute(documentId);

        // Assert
        expect(result).toEqual([]);
        expect(fileRepository.findByDocumentId).toHaveBeenCalledWith(documentId);
    });

    //================================================================//
    //                  BUSINESS LOGIC FAILURES                       //
    //================================================================//

    it('should throw an error if the repository returns null', async () => {
        // Arrange
        // This tests the explicit `if(!file)` check in the use case.
        fileRepository.findByDocumentId.mockResolvedValue(null as any);

        // Act & Assert
        await expect(getFileByDocumentIdUseCase.execute(documentId)).rejects.toThrow('File not found');
        expect(fileRepository.findByDocumentId).toHaveBeenCalledWith(documentId);
    });
});
