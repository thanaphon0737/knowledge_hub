/**
 * @fileoverview This file contains the Jest unit tests for the UpdateFileUsecase.
 */

import { UpdateFileUsecase } from '../UpdateFile.usecase';
import { IFileRepository } from '../../../repositories/IFileRepository';
import { File } from '../../../../domain/entities/file.entity';
import { mock, MockProxy } from 'jest-mock-extended';

describe('UpdateFileUsecase', () => {
    let fileRepository: MockProxy<IFileRepository>;
    let updateFileUsecase: UpdateFileUsecase;

    const fileId = 'file-to-update';
    const updatePayload: Partial<File> & { id: string } = {
        id: fileId,
        processing_status: 'completed',
        file_name: 'new-name.docx',
    };

    const updatedFile: File = {
        id: fileId,
        document_id: 'doc-123',
        source_type: 'upload',
        file_name: 'new-name.docx',
        source_location: '/uploads/old-name.docx',
        file_size: 5000,
        file_type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        processing_status: 'completed',
        created_at: new Date(),
        updated_at: new Date(),
    };

    beforeEach(() => {
        fileRepository = mock<IFileRepository>();
        updateFileUsecase = new UpdateFileUsecase(fileRepository);
    });

    //================================================================//
    //                          HAPPY PATH                            //
    //================================================================//

    it('should update a file and return the updated file', async () => {
        // Arrange
        fileRepository.update.mockResolvedValue(updatedFile);

        // Act
        const result = await updateFileUsecase.execute(updatePayload);

        // Assert
        expect(result).toEqual(updatedFile);
        expect(fileRepository.update).toHaveBeenCalledWith(updatePayload);
        expect(fileRepository.update).toHaveBeenCalledTimes(1);
    });
    
    //================================================================//
    //                    INPUT VALIDATION FAILURES                   //
    //================================================================//

    it('should throw an error if the file ID is not provided in the payload', async () => {
        // Arrange
        const invalidPayload = { processing_status: 'failed' } as Partial<File> & { id: string };

        // Act & Assert
        await expect(updateFileUsecase.execute(invalidPayload)).rejects.toThrow(
            'File id is required.'
        );

        // Assert
        expect(fileRepository.update).not.toHaveBeenCalled();
    });

    //================================================================//
    //                  BUSINESS LOGIC FAILURES                       //
    //================================================================//

    it('should throw an error if the file to update is not found', async () => {
        // Arrange
        fileRepository.update.mockResolvedValue(null);

        // Act & Assert
        await expect(updateFileUsecase.execute(updatePayload)).rejects.toThrow(
            'File not found.'
        );
        expect(fileRepository.update).toHaveBeenCalledWith(updatePayload);
        expect(fileRepository.update).toHaveBeenCalledTimes(1);
    });
});
