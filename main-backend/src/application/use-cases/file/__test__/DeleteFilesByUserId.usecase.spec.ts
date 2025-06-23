/**
 * @fileoverview This file contains the Jest unit tests for the DeleteFilesByUserIdUsecase.
 */

import { DeleteFilesByUserIdUsecase } from '../DeleteFilesByUserId.usecase';
import { IFileRepository } from '../../../repositories/IFileRepository';
import { mock, MockProxy } from 'jest-mock-extended';

describe('DeleteFilesByUserIdUsecase', () => {
    let fileRepository: MockProxy<IFileRepository>;
    let deleteFilesByUserIdUsecase: DeleteFilesByUserIdUsecase;
    const userId = 'user-789';

    beforeEach(() => {
        fileRepository = mock<IFileRepository>();
        deleteFilesByUserIdUsecase = new DeleteFilesByUserIdUsecase(fileRepository);
    });

    //================================================================//
    //                          HAPPY PATH                            //
    //================================================================//

    it('should delete all files for a user when a valid user ID is provided', async () => {
        // Arrange
        fileRepository.deleteAllByUserId.mockResolvedValue();

        // Act
        await deleteFilesByUserIdUsecase.execute(userId);

        // Assert
        expect(fileRepository.deleteAllByUserId).toHaveBeenCalledWith(userId);
        expect(fileRepository.deleteAllByUserId).toHaveBeenCalledTimes(1);
    });

    //================================================================//
    //                    INPUT VALIDATION FAILURES                   //
    //================================================================//
    
    it('should throw an error if the user ID is not provided', async () => {
        // Arrange
        const invalidUserId = '';

        // Act & Assert
        await expect(deleteFilesByUserIdUsecase.execute(invalidUserId)).rejects.toThrow(
            'userId not found or not have files'
        );
        expect(fileRepository.deleteAllByUserId).not.toHaveBeenCalled();
    });
    
    //================================================================//
    //                    DEPENDENCY INTERACTION                      //
    //================================================================//

    it('should propagate errors from the repository', async () => {
        // Arrange
        const dbError = new Error('Failed to execute query');
        fileRepository.deleteAllByUserId.mockRejectedValue(dbError);

        // Act & Assert
        await expect(deleteFilesByUserIdUsecase.execute(userId)).rejects.toThrow(dbError);
        expect(fileRepository.deleteAllByUserId).toHaveBeenCalledWith(userId);
        expect(fileRepository.deleteAllByUserId).toHaveBeenCalledTimes(1);
    });
});
