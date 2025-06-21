import { File } from "../../../domain/entities/file.entity";
import { IFileRepository } from "../../repositories/IFileRepository";

export class CreateFileUseCase {
    private fileRepository: IFileRepository;

    constructor(fileRepository: IFileRepository) {
        this.fileRepository = fileRepository;
    }

    async execute(
        documentId: string,
        sourceType: string,
        fileName: string,
        sourceLocation: string,
        fileSize: number,
        fileType: string,
        processingStatus: string
    ): Promise<File> {
        // 1. Input Validation
        if (!documentId || !sourceType || !fileName || !sourceLocation || !fileSize || !fileType || !processingStatus) {
            throw new Error("All fields are required");
        }

        // 2. Create File
        const file = await this.fileRepository.create({
            document_id: documentId,
            source_type: sourceType,
            file_name: fileName,
            source_location: sourceLocation,
            file_size: fileSize,
            file_type: fileType,
            processing_status: processingStatus
        });

        // 3. Return Created File
        return file;
    }
}