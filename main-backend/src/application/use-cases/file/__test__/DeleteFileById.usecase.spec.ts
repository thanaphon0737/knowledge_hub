/**
 * @fileoverview This file contains the Jest unit tests for the DeletesFileByIdUsecase.
 */

import { DeletesFileByIdUsecase } from '../DeleteFileById.usecase';
import { IFileRepository } from '../../../repositories/IFileRepository';
import { mock, MockProxy } from 'jest-mock-extended';

describe('DeletesFileByIdUsecase', () => {
    let fileRepository: MockProxy<IFileRepository>;
    let deletesFileByIdUsecase: DeletesFileByIdUsecase;
    const fileId = 'file-123';

    beforeEach(() => {
        fileRepository = mock<IFileRepository>();
        deletesFileByIdUsecase = new DeletesFileByIdUsecase(fileRepository);
    });

    //================================================================//
    //                          HAPPY PATH                            //
    //================================================================//

    it('should delete a file successfully when a valid ID is provided', async () => {
        // Arrange
        fileRepository.deleteById.mockResolvedValue(); // Mocks a successful void return

        // Act
        await deletesFileByIdUsecase.execute(fileId);

        // Assert
        expect(fileRepository.deleteById).toHaveBeenCalledWith(fileId);
        expect(fileRepository.deleteById).toHaveBeenCalledTimes(1);
    });

    //================================================================//
    //                    INPUT VALIDATION FAILURES                   //
    //================================================================//

    it('should throw an error if the file ID is not provided', async () => {
        // Arrange
        const invalidId = '';

        // Act & Assert
        await expect(deletesFileByIdUsecase.execute(invalidId)).rejects.toThrow(
            'File id not found or not have files'
        );

        // Assert
        expect(fileRepository.deleteById).not.toHaveBeenCalled();
    });
    
    //================================================================//
    //                    DEPENDENCY INTERACTION                      //
    //================================================================//
    
    it('should propagate errors from the file repository during deletion', async () => {
        // Arrange
        const repositoryError = new Error('Database connection failed');
        fileRepository.deleteById.mockRejectedValue(repositoryError);

        // Act & Assert
        await expect(deletesFileByIdUsecase.execute(fileId)).rejects.toThrow(repositoryError);

        // Assert
        expect(fileRepository.deleteById).toHaveBeenCalledWith(fileId);
        expect(fileRepository.deleteById).toHaveBeenCalledTimes(1);
    });
});
