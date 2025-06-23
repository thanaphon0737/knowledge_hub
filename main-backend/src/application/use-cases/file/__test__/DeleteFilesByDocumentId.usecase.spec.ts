/**
 * @fileoverview This file contains the Jest unit tests for the DeleteFilesByDocumentIdUsecase.
 */

import { DeleteFilesByDocumentIdUsecase } from '../DeleteFilesByDocumentId.usecase';
import { IFileRepository } from '../../../repositories/IFileRepository';
import { mock, MockProxy } from 'jest-mock-extended';

describe('DeleteFilesByDocumentIdUsecase', () => {
    let fileRepository: MockProxy<IFileRepository>;
    let deleteFilesByDocumentIdUsecase: DeleteFilesByDocumentIdUsecase;
    const documentId = 'doc-456';

    beforeEach(() => {
        fileRepository = mock<IFileRepository>();
        deleteFilesByDocumentIdUsecase = new DeleteFilesByDocumentIdUsecase(fileRepository);
    });
    
    //================================================================//
    //                          HAPPY PATH                            //
    //================================================================//

    it('should delete files successfully when a valid document ID is provided', async () => {
        // Arrange
        fileRepository.deleteByDocumentId.mockResolvedValue();

        // Act
        await deleteFilesByDocumentIdUsecase.execute(documentId);

        // Assert
        expect(fileRepository.deleteByDocumentId).toHaveBeenCalledWith(documentId);
        expect(fileRepository.deleteByDocumentId).toHaveBeenCalledTimes(1);
    });

    //================================================================//
    //                    INPUT VALIDATION FAILURES                   //
    //================================================================//

    it('should throw an error if the document ID is not provided', async () => {
        // Arrange
        const invalidDocumentId = '';

        // Act & Assert
        await expect(deleteFilesByDocumentIdUsecase.execute(invalidDocumentId)).rejects.toThrow(
            'documentId not found or not have files'
        );
        expect(fileRepository.deleteByDocumentId).not.toHaveBeenCalled();
    });

    //================================================================//
    //                    DEPENDENCY INTERACTION                      //
    //================================================================//

    it('should propagate errors from the file repository', async () => {
        // Arrange
        const repositoryError = new Error('Database error');
        fileRepository.deleteByDocumentId.mockRejectedValue(repositoryError);

        // Act & Assert
        await expect(deleteFilesByDocumentIdUsecase.execute(documentId)).rejects.toThrow(repositoryError);
        expect(fileRepository.deleteByDocumentId).toHaveBeenCalledWith(documentId);
        expect(fileRepository.deleteByDocumentId).toHaveBeenCalledTimes(1);
    });
});
