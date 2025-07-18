import { RequestHandler } from "express";
import { PostgresDocumentRepository } from "../../database/postgres/PostgresDocumentRepository";
import { CreateDocumentUseCase } from "../../../application/use-cases/documents/CreateDocument.usecase";
import { GetDocumentByIdUseCase } from "../../../application/use-cases/documents/GetDocumentById.usecase";
import { GetDocuments } from "../../../application/use-cases/documents/GetDocuments.usecase";
import { DocumentResponseDto } from "../../../application/dtos/document.dto";
import { UpdateDocumentUseCase } from "../../../application/use-cases/documents/UpdateDocument.usecase";
import { DeleteDocumentByIdUseCase } from "../../../application/use-cases/documents/DeleteDocument.usecase";
// -- สร้าง Instance ของ Repository --
const documentRepository = new PostgresDocumentRepository();
export const createDocument: RequestHandler = async (req, res) => {
  const userId = req.user?.id; // สมมติว่า req.user ถูกตั้งค่าโดย middleware ที่ตรวจสอบ JWT
  const { name, description } = req.body;
  console.log("name", name);
  console.log("description", description);
  if (!userId || !name) {
    res
      .status(400)
      .json({ success: false, message: "User ID and name are required" });
    return;
  }

  try {
    // สร้างและเรียกใช้ CreateDocumentUseCase
    const createDocumentUseCase = new CreateDocumentUseCase(documentRepository);
    const document = await createDocumentUseCase.execute(
      userId,
      name,
      description
    );

    // แปลงข้อมูล Document เป็น DTO (Data Transfer Object) เพื่อส่งกลับ
    const documentResponse: DocumentResponseDto = {
      id: document.id,
      user_id: document.user_id,
      name: document.name,
      description: document.description,
      created_at: document.created_at,
      updated_at: document.updated_at,
    };
    res.status(201).json({ success: true, data: documentResponse });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getDocumentById: RequestHandler = async (req, res) => {
  const documentId = req.params.id;
  const userId = req.user?.id; //
  if (!userId) {
    res.status(400).json({ success: false, message: "User ID is required" });
    return;
  }

  if (!documentId) {
    res
      .status(400)
      .json({ success: false, message: "Document ID is required" });
    return;
  }
  try {
    // สร้างและเรียกใช้ GetDocumentByIdUseCase
    const getDocumentByIdUseCase = new GetDocumentByIdUseCase(
      documentRepository
    );
    const document = await getDocumentByIdUseCase.execute(userId, documentId);
    if (!document) {
      res.status(404).json({ success: false, message: "Document not found" });
      return;
    }

    // แปลงข้อมูล Document เป็น DTO (Data Transfer Object) เพื่อส่งกลับ
    const documentResponse: DocumentResponseDto = {
      id: document.id,
      user_id: document.user_id,
      name: document.name,
      description: document.description,
      created_at: document.created_at,
      updated_at: document.updated_at,
    };
    res.status(200).json({ success: true, data: documentResponse });
  } catch (error: any) {
    res
      .status(400)
      .json({ success: false, message: "Document ID is required" });
    return;
  }
};

export const getDocuments: RequestHandler = async (req, res) => {
  const userId = req.user?.id; //
  if (!userId) {
    res.status(400).json({ success: false, message: "User ID is required" });
    return;
  }
  try {
    // เรียกใช้ Use Case เพื่อดึงข้อมูล Document
    const getDocumentsUseCase = new GetDocuments(documentRepository);
    const documents = await getDocumentsUseCase.execute(userId);
    if (!documents || documents.length === 0) {
      res.status(404).json({ success: false, message: "No documents found" });
      return;
    }
    // แปลงข้อมูล Document เป็น DTO (Data Transfer Object) เพื่อส่งกลับ
    const documentsResponse: DocumentResponseDto[] = documents.map((doc) => ({
      id: doc.id,
      user_id: doc.user_id,
      name: doc.name,
      description: doc.description,
      created_at: doc.created_at,
      updated_at: doc.updated_at,
    }));
    res.status(200).json({ success: true, data: documentsResponse });
    return
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
    return;
  }
};

export const updateDocument: RequestHandler = async (req, res) => {
  const userId = req.user?.id; // สมมติว่า req.user ถูกตั้งค่าโดย middleware ที่ตรวจสอบ JWT
  const documentId = req.params.id;
  const { name, description } = req.body;

  if (!userId || !documentId) {
    res.status(400).json({ success: false, message: "User ID and Document ID are required" });
    return;
  }

  try {
    // สร้างและเรียกใช้ UpdateDocumentUseCase
    const updateDocumentUseCase = new UpdateDocumentUseCase(documentRepository);
    const updatedDocument = await updateDocumentUseCase.execute({
      id: documentId,
      user_id: userId,
      name,
      description,
    });

    if (!updatedDocument) {
      res.status(404).json({ success: false, message: "Document not found or user does not have permission" });
      return;
    }

    // แปลงข้อมูล Document เป็น DTO (Data Transfer Object) เพื่อส่งกลับ
    const documentResponse: DocumentResponseDto = {
      id: updatedDocument.id,
      user_id: updatedDocument.user_id,
      name: updatedDocument.name,
      description: updatedDocument.description,
      created_at: updatedDocument.created_at,
      updated_at: updatedDocument.updated_at,
    };
    res.status(200).json({ success: true, data: documentResponse });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
}

export const deleteDocument: RequestHandler = async (req, res) => {
  const userId = req.user?.id; // สมมติว่า req.user ถูกตั้งค่าโดย middleware ที่ตรวจสอบ JWT
  const documentId = req.params.id;

  if (!userId || !documentId) {
    res.status(400).json({ success: false, message: "User ID and Document ID are required" });
    return;
  }

  try {
    // สร้างและเรียกใช้ DeleteDocumentByIdUseCase
    const deleteDocumentUseCase = new DeleteDocumentByIdUseCase(documentRepository);
    await deleteDocumentUseCase.execute(documentId, userId);
    res.status(204).send(); // ส่งสถานะ 204 No Content เมื่อสำเร็จ
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};