/**
 * @fileoverview This file contains the Jest unit tests for the CreateFileUseCase.
 * @author thanaphon
 */

import { CreateFileUseCase } from "../CreateFile.usecase"
import { IFileRepository } from '../../../repositories/IFileRepository';
import { File } from '../../../../domain/entities/file.entity'
import { mock, MockProxy } from 'jest-mock-extended';
import { IProcessingService } from "../../../services/IProcessingService";

/**
 * Test suite for the CreateFileUseCase.
 *
 * This suite covers all scenarios for the file creation use case,
 * including the happy path, input validation failures, and repository interactions.
 */
describe('CreateFileUseCase', () => {
    // Mock the IFileRepository dependency to isolate the use case from the database layer.
    let fileRepository: MockProxy<IFileRepository>;
    let processingService : MockProxy<IProcessingService>;

    let createFileUseCase: CreateFileUseCase;

    // Sample valid data for creating a file.
    const validFileData = {
        userId: 'user-123',
        documentId: 'doc-123',
        sourceType: 'upload',
        fileName: 'test-document.pdf',
        sourceLocation: '/uploads/test-document.pdf',
        fileSize: 1024,
        fileType: 'application/pdf',
        processingStatus: 'pending',
    };

    // Expected file object upon successful creation.
    const expectedFile: File = {
        id: 'file-456',
        ...validFileData,
        created_at: new Date(),
        updated_at: new Date(),
        // Map domain entity fields from input
        document_id: validFileData.documentId,
        source_type: validFileData.sourceType,
        file_name: validFileData.fileName,
        source_location: validFileData.sourceLocation,
        file_size: validFileData.fileSize,
        file_type: validFileData.fileType,
        processing_status: validFileData.processingStatus,
    };

    /**
     * Sets up a fresh instance of the use case and its mocked dependencies
     * before each test is run. This ensures test isolation.
     */
    beforeEach(() => {
        // Create a new mock for the repository before each test.
        fileRepository = mock<IFileRepository>();
        processingService = mock<IProcessingService>();
        // Instantiate the use case with the mocked repository.
        createFileUseCase = new CreateFileUseCase(fileRepository,processingService);
    });

    //================================================================//
    //                          HAPPY PATH                            //
    //================================================================//

    /**
     * Test case for the successful creation of a file with valid data.
     * It ensures the repository's create method is called and the file is returned.
     */
    it('should create a file successfully when all data is valid', async () => {
        // Arrange: Configure the mock repository to return the expected file.
        fileRepository.create.mockResolvedValue(expectedFile);

        // Act: Execute the use case with valid data.
        const result = await createFileUseCase.execute(
            validFileData.userId,
            validFileData.documentId,
            validFileData.sourceType,
            validFileData.fileName,
            validFileData.sourceLocation,
            validFileData.fileSize,
            validFileData.fileType,
            validFileData.processingStatus
        );

        // Assert: Verify the outcome of the use case execution.
        // 1. Check if the returned file matches the expected file.
        expect(result).toEqual(expectedFile);

        // 2. Verify that the repository's create method was called exactly once.
        expect(fileRepository.create).toHaveBeenCalledTimes(1);

        // 3. Verify that the repository's create method was called with the correct arguments.
        expect(fileRepository.create).toHaveBeenCalledWith({
            document_id: validFileData.documentId,
            source_type: validFileData.sourceType,
            file_name: validFileData.fileName,
            source_location: validFileData.sourceLocation,
            file_size: validFileData.fileSize,
            file_type: validFileData.fileType,
            processing_status: validFileData.processingStatus,
        });
    });

    //================================================================//
    //                    INPUT VALIDATION FAILURES                   //
    //================================================================//

    /**
     * Parameterized test for input validation failures.
     * This test checks that the use case throws an error if any required field is missing.
     */
    test.each([
        { field: 'userId', value: '' },
        { field: 'documentId', value: '' },
        { field: 'sourceType', value: '' },
        { field: 'fileName', value: '' },
        { field: 'sourceLocation', value: '' },
        { field: 'fileSize', value: 0 },
        { field: 'fileType', value: '' },
        { field: 'processingStatus', value: '' },
    ])('should throw an error if $field is invalid', async ({ field, value }) => {
        // Arrange: Create a copy of valid data and invalidate one field.
        const invalidData = { ...validFileData, [field]: value };

        // Act & Assert: Execute the use case and expect it to throw a specific error.
        await expect(
            createFileUseCase.execute(
                invalidData.userId,
                invalidData.documentId,
                invalidData.sourceType,
                invalidData.fileName,
                invalidData.sourceLocation,
                invalidData.fileSize,
                invalidData.fileType,
                invalidData.processingStatus
            )
        ).rejects.toThrow('All fields are required');

        // Assert: Ensure the repository's create method was never called.
        expect(fileRepository.create).not.toHaveBeenCalled();
    });

    //================================================================//
    //                    DEPENDENCY INTERACTION                      //
    //================================================================//

    /**
     * Test case to ensure the use case correctly handles errors from the repository.
     */
    it('should propagate errors from the file repository', async () => {
        // Arrange: Configure the mock repository to throw an error.
        const repositoryError = new Error('Database connection failed');
        fileRepository.create.mockRejectedValue(repositoryError);

        // Act & Assert: Execute the use case and expect it to reject with the same error.
        await expect(
            createFileUseCase.execute(
                validFileData.userId,
                validFileData.documentId,
                validFileData.sourceType,
                validFileData.fileName,
                validFileData.sourceLocation,
                validFileData.fileSize,
                validFileData.fileType,
                validFileData.processingStatus
            )
        ).rejects.toThrow(repositoryError);
        
        // Assert: Verify that the repository's create method was still called once.
        expect(fileRepository.create).toHaveBeenCalledTimes(1);
    });
});
