import { RequestHandler } from "express";
import { PostgresFileRepository } from "../../database/postgres/PostgresFileRepository";
import { CreateFileUseCase } from "../../../application/use-cases/file/CreateFile.usecase";

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
    
        res.status(201).json({ success: true, data: file });
    } catch (error: any) {
        res.status(400).json({ success: false, message: error.message });
    }
    }