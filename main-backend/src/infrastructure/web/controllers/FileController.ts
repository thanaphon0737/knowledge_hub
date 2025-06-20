import { RequestHandler } from "express";
import { PostgresFileRepository } from "../../database/postgres/PostgresFileRepository";
import { CreateFileUseCase } from "../../../application/use-cases/file/CreateFile.usecase";
import { FileCreateDto } from "../../../application/dtos/file.dto";

// -- สร้าง Instance ของ Repository --
const fileRepository = new PostgresFileRepository();

export const createFile: RequestHandler = async (req, res) => {

    const { documentId, sourceType, fileName, sourceLocation, fileSize, fileType, processingStatus } = req.body;
    
    if (!documentId || !sourceType || !fileName || !sourceLocation || !fileSize || !fileType || !processingStatus) {
        res.status(400).json({ success: false, message: "All fields are required" });
        return;
    }
    
    try {
        // สร้างและเรียกใช้ CreateFileUseCase
        const createFileUseCase = new CreateFileUseCase(fileRepository);
        const file = await createFileUseCase.execute(
        documentId,
        sourceType,
        fileName,
        sourceLocation,
        fileSize,
        fileType,
        processingStatus
        );
    
        const FileResponse: FileCreateDto = {
            document_id: documentId,
            source_type: sourceType,
            file_name: fileName,
            source_location: sourceLocation,
            file_size: fileSize,
            file_type: fileType,
            processing_status: processingStatus
        }
        res.status(201).json({ success: true, data: FileResponse });
    } catch (error: any) {
        res.status(400).json({ success: false, message: error.message });
    }
    }