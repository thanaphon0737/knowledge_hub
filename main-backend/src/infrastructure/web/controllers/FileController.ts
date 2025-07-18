import { RequestHandler } from "express";
import { PostgresFileRepository } from "../../database/postgres/PostgresFileRepository";
import { AIServiceClient } from "../../services/AIServiceClient";
import {
  FileCreateDto,
  FileResponseDto,
  FileUpdateDto,
} from "../../../application/dtos/file.dto";

import { CreateFileUseCase } from "../../../application/use-cases/file/CreateFile.usecase";

import { GetFileByIdUseCase } from "../../../application/use-cases/file/GetFileById.usecase";
import { GetFileByDocumentIdUseCase } from "../../../application/use-cases/file/GetFilesByDocumentId.usecase";
import { UpdateFileUsecase } from "../../../application/use-cases/file/UpdateFile.usecase";

import { DeleteFilesByUserIdUsecase } from "../../../application//use-cases/file/DeleteFilesByUserId.usecase";
import { DeleteFilesByDocumentIdUsecase } from "../../../application/use-cases/file/DeleteFilesByDocumentId.usecase";
import { DeletesFileByIdUsecase } from "../../../application/use-cases/file/DeleteFileById.usecase";

import { supabase } from "../../database/storage"; // Import Supabase client

const fileRepository = new PostgresFileRepository();
const processingService = new AIServiceClient();

export const createFileFromUrl: RequestHandler = async (req, res) => {
  const documentId = req.params.documentId;
  const user = req.user;
  const userId = user?.id;
  const { sourceUrl } = req.body;
  if (!user) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
  if (!userId) {
    res.status(400).json({ success: false, message: "userId not found" });
    return;
  }
  if (!documentId) {
    res.status(400).json({ success: false, message: "Document Id not found" });
    return;
  }
  if (!sourceUrl) {
    res.status(400).json({ success: false, message: "Source Url not found" });
    return;
  }
  try {
    const createFileUseCase = new CreateFileUseCase(
      fileRepository,
      processingService
    );
    console.log("create file with Url");
    const file = await createFileUseCase.execute({
      userId: userId,
      documentId: documentId,
      sourceType: "url",
      fileName: sourceUrl,
      sourceLocation: sourceUrl,
      fileSize: 0,
      fileType: "text/html",
      processingStatus: "PENDING",
    });

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
    return;
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
    return;
  }
};
export const createFile: RequestHandler = async (req, res) => {
  const documentId = req.params.documentId;
  const userId = req.user?.id;
  const user = req.user;
  const uploadedFile = req.file;
  if (!user) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  if (!uploadedFile) {
    res.status(400).json({ message: "No file uploaded." });
    return;
  }
  if (!userId) {
    res.status(400).json({ success: false, message: "userId not found" });
    return;
  }
  if (!documentId) {
    res.status(400).json({ success: false, message: "Document Id not found" });
    return;
  }
  if (typeof uploadedFile?.size !== "number") {
    res.status(400).json({
      success: false,
      message: "Uploaded file size is missing or invalid.",
    });
    return;
  }
  if (typeof uploadedFile?.mimetype !== "string") {
    res.status(400).json({
      success: false,
      message: "Uploaded file type is missing or invalid.",
    });
    return;
  }
  const originalname = uploadedFile?.originalname || "unknown-file";
  const bucketName = "knowledge-files";
  const fileName = `user-docs/${userId}/${Date.now()}-${originalname}`;
  const buffer = uploadedFile?.buffer;
  const mimetype = uploadedFile?.mimetype;
  const { data, error } = await supabase.storage
    .from(bucketName)
    .upload(fileName, buffer, {
      contentType: mimetype,
      upsert: true,
    });

  if (error) {
    throw new Error(`Failed to upload file: ${error.message}`);
  }
  console.log("recieve file for document: ", documentId);
  console.log("fileName: ", fileName);
  console.log("file size: ", uploadedFile.size);
  
  const filePath = data.path; // Path in Supabase Storage
  console.log("📂 File uploaded to Supabase Storage:", filePath);
  try {
    // สร้างและเรียกใช้ CreateFileUseCase
    // const localFilePath: string = uploadedFile.path;
    

    const sourceType: string = "upload";

    const createFileUseCase = new CreateFileUseCase(
      fileRepository,
      processingService
    );

    const file = await createFileUseCase.execute({
      userId: userId,
      documentId: documentId,
      sourceType: sourceType,
      fileName: uploadedFile?.originalname,
      sourceLocation: filePath,
      fileSize: uploadedFile.size,
      fileType: uploadedFile.mimetype,
      processingStatus: "PENDING",
    });

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
    return;
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
    return;
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
    return;
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
    return;
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
      res.status(404).json({ success: false, message: "can not get files" });
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
    return;
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
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
      res.status(404).json({
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

export const deleteFilesByUserId: RequestHandler = async (req, res) => {
  const userId = req.user?.id;
  if (!userId) {
    res.status(400).json({ sucess: false, message: "user ID not found." });
    return;
  }
  try {
    const deleteFilesByUserIdUseCase = new DeleteFilesByUserIdUsecase(
      fileRepository
    );
    await deleteFilesByUserIdUseCase.execute(userId);
    res.status(204).send();
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteFilesByDocumentId: RequestHandler = async (req, res) => {
  const documentId = req.params.documentId;
  if (!documentId) {
    res.status(400).json({ sucess: false, message: "Document ID not found." });
    return;
  }
  try {
    const deleteFilesByDocumentIdUsecase = new DeleteFilesByDocumentIdUsecase(
      fileRepository
    );
    await deleteFilesByDocumentIdUsecase.execute(documentId);
    res.status(204).send();
  } catch (error: any) {
    res.status(400).json({ sucess: false, message: error.message });
  }
};

export const deleteFileById: RequestHandler = async (req, res) => {
  const id = req.params.id;
  if (!id) {
    res.status(400).json({ sucesss: false, message: "file ID not found" });
    return;
  }
  try {
    const deleteFileByIdUseCase = new DeletesFileByIdUsecase(fileRepository);
    await deleteFileByIdUseCase.execute(id);
    res.status(204).send();
  } catch (error: any) {
    res.status(400).json({ sucesss: false, message: error.message });
  }
};
