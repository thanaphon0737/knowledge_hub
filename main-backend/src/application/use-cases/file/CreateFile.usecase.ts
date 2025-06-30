import { File } from "../../../domain/entities/file.entity";
import { IFileRepository } from "../../repositories/IFileRepository";
import { IProcessingService } from "../../services/IProcessingService";

export interface CreateFileInput {
  userId: string;
  documentId: string;
  sourceType: string;
  fileName: string;
  sourceLocation: string;
  fileSize: number;
  fileType: string;
  processingStatus: string;
}
export class CreateFileUseCase {
  private fileRepository: IFileRepository;
  private processingService: IProcessingService;
  constructor(
    fileRepository: IFileRepository,
    processingService: IProcessingService
  ) {
    this.fileRepository = fileRepository;
    this.processingService = processingService;
  }

  async execute(input: CreateFileInput): Promise<File> {
    
    // 1. Input Validation
    console.log(input)
    const {
      userId,
      documentId,
      sourceType,
      fileName,
      sourceLocation,
      fileSize,
      fileType,
      processingStatus,
    } = input;
    if(!userId){
        throw new Error("userId not found")
    }
    if (
      !userId ||
      !documentId ||
      !sourceType ||
      !fileName ||
      !sourceLocation ||
      !fileType ||
      !processingStatus
    ) {
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
      processing_status: processingStatus,
    });

    // call ai service
    const fileInfo = {
      fileId: file.id,
      userId: userId,
      sourceType: file.source_type,
      sourceLocation: file.source_location,
    };
    await this.processingService.startProcessing(fileInfo);
    // 3. Return Created File
    return file;
  }
}
