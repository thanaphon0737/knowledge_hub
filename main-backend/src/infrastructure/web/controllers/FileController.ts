import { RequestHandler } from "express";
import { PostgresFileRepository } from "../../database/postgres/PostgresFileRepository";

import {
  FileCreateDto,
  FileResponseDto,
  FileUpdateDto,
} from "../../../application/dtos/file.dto";

import { CreateFileUseCase } from "../../../application/use-cases/file/CreateFile.usecase";

import { GetFileByIdUseCase } from "../../../application/use-cases/file/GetFileById.usecase";
import { GetFileByDocumentIdUseCase } from "../../../application/use-cases/file/GetFilesByDocumentId.usecase";
import { UpdateFileUsecase } from "../../../application/use-cases/file/UpdateFile.usecase";
// -- สร้าง Instance ของ Repository --
const fileRepository = new PostgresFileRepository();

export const createFile: RequestHandler = async (req, res) => {
  const {
    documentId,
    sourceType,
    fileName,
    sourceLocation,
    fileSize,
    fileType,
    processingStatus,
  } = req.body;

  if (
    !documentId ||
    !sourceType ||
    !fileName ||
    !sourceLocation ||
    !fileSize ||
    !fileType ||
    !processingStatus
  ) {
    res
      .status(400)
      .json({ success: false, message: "All fields are required" });
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
      document_id: file.document_id,
      source_type: file.source_type,
      file_name: file.file_name,
      source_location: file.source_location,
      file_size: file.file_size,
      file_type: file.file_type,
      processing_status: file.processing_status,
    };
    res.status(201).json({ success: true, data: FileResponse });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getFileById: RequestHandler = async (req, res) => {
  const fileId = req.params.id;
  if (!fileId) {
    res.status(400).json({ success: false, message: "fileId is required" });
    return;
  }
  try {
    const getFileByIdUseCase = new GetFileByIdUseCase(fileRepository);
    const file = await getFileByIdUseCase.execute(fileId);
    if (!file) {
      res.status(400).json({ success: false, message: "can not get file" });
      return;
    }
    const FileResponse: FileResponseDto = {
      id: file?.id,
      document_id: file?.document_id,
      source_type: file?.source_type,
      file_name: file?.file_name,
      source_location: file?.source_location,
      file_size: file?.file_size,
      file_type: file?.file_type,
      processing_status: file?.processing_status,
      created_at: file?.created_at,
      updated_at: file?.updated_at,
    };
    res.status(200).json({ success: true, data: FileResponse });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getFileByDocumentId: RequestHandler = async (req, res) => {
  const documentId = req.params.documentId;
  if (!documentId) {
    res.status(400).json({ success: false, message: "documentId is required" });
    return;
  }
  try {
    const getFileByDocumentIdUseCase = new GetFileByDocumentIdUseCase(
      fileRepository
    );
    const files = await getFileByDocumentIdUseCase.execute(documentId);
    if (files.length === 0) {
      res.status(400).json({ success: false, message: "can not get files" });
      return;
    }
    const FilesResponse: FileResponseDto[] = files.map((file) => ({
      id: file?.id,
      document_id: file?.document_id,
      source_type: file?.source_type,
      file_name: file?.file_name,
      source_location: file?.source_location,
      file_size: file?.file_size,
      file_type: file?.file_type,
      processing_status: file?.processing_status,
      created_at: file?.created_at,
      updated_at: file?.updated_at,
    }));
    res.status(200).json({ success: true, data: FilesResponse });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updateFile: RequestHandler = async (req, res) => {
  const fileId = req.params.id;
  if (!fileId) {
    res
      .status(400)
      .json({ success: false, message: "fileId is required params" });
    return;
  }
  const { fileName, sourceLocation, processingStatus } = req.body;
  try {
    const updateFileUsecase = new UpdateFileUsecase(fileRepository);
    const updatedFile = await updateFileUsecase.execute({
      id: fileId,
      file_name: fileName,
      source_location: sourceLocation,
      processing_status: processingStatus,
    });

    if (!updatedFile) {
      res
        .status(404)
        .json({
          success: false,
          message: "File not found or user does not have permission",
        });
      return;
    }
    const FilesResponse: FileUpdateDto = {
      id: updatedFile.id,
      document_id: updatedFile?.document_id,
      source_type: updatedFile?.source_type,
      file_name: updatedFile?.file_name,
      source_location: updatedFile?.source_location,
      file_size: updatedFile?.file_size,
      file_type: updatedFile?.file_type,
      processing_status: updatedFile?.processing_status,
    };
    res.status(200).json({ success: true, data: FilesResponse });
  } catch (error: any) {}
};
