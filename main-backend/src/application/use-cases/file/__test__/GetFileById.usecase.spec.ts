/**
 * @fileoverview This file contains the Jest unit tests for the GetFileByIdUseCase.
 */

import { GetFileByIdUseCase } from '../GetFileById.usecase';
import { IFileRepository } from '../../../repositories/IFileRepository';
import { File } from '../../../../domain/entities/file.entity';
import { mock, MockProxy } from 'jest-mock-extended';

describe('GetFileByIdUseCase', () => {
    let fileRepository: MockProxy<IFileRepository>;
    let getFileByIdUseCase: GetFileByIdUseCase;
    const fileId = 'file-abc';
    const expectedFile: File = {
        id: fileId,
        document_id: 'doc-123',
        source_type: 'upload',
        file_name: 'test.txt',
        source_location: '/uploads/test.txt',
        file_size: 123,
        file_type: 'text/plain',
        processing_status: 'completed',
        created_at: new Date(),
        updated_at: new Date(),
    };

    beforeEach(() => {
        fileRepository = mock<IFileRepository>();
        getFileByIdUseCase = new GetFileByIdUseCase(fileRepository);
    });

    //================================================================//
    //                          HAPPY PATH                            //
    //================================================================//

    it('should return a file when a valid ID is provided', async () => {
        // Arrange
        fileRepository.findById.mockResolvedValue(expectedFile);

        // Act
        const result = await getFileByIdUseCase.execute(fileId);

        // Assert
        expect(result).toEqual(expectedFile);
        expect(fileRepository.findById).toHaveBeenCalledWith(fileId);
        expect(fileRepository.findById).toHaveBeenCalledTimes(1);
    });
    
    //================================================================//
    //                  BUSINESS LOGIC FAILURES                       //
    //================================================================//

    it('should throw an error if the file is not found', async () => {
        // Arrange
        fileRepository.findById.mockResolvedValue(null);

        // Act & Assert
        await expect(getFileByIdUseCase.execute(fileId)).rejects.toThrow('File not found');
        expect(fileRepository.findById).toHaveBeenCalledWith(fileId);
        expect(fileRepository.findById).toHaveBeenCalledTimes(1);
    });
});
