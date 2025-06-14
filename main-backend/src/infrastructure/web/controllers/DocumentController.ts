import { RequestHandler } from "express";
import { PostgresDocumentRepository } from "../../database/postgres/PostgresDocumentRepository";
import { CreateDocumentUseCase } from "../../../application/use-cases/documents/CreateDocument.usecase";
import { DocumentResponseDto } from "../../../application/dtos/document.dto";

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

export const getDocument: RequestHandler = async (req, res) => {
  console.log("getDocument");
  const documentId = req.params.id;
  console.log("documentId", documentId);
  console.log("req.user", req.user);
  const userId = req.user?.id; //
  if (!userId) {
    res.status(400).json({ success: false, message: "User ID is required" });
    return;
  }

  if (!documentId) {
    res.status(400).json({ success: false, message: "Document ID is required" });
    return;
  }
  try {
      const document = await documentRepository.findByIdAndUserId(
        documentId,
        userId
      );
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

export const listDocuments: RequestHandler = async (req, res) => {
  const userId = req.user?.id; //
  if (!userId) {
    res.status(400).json({ success: false, message: "User ID is required" });
    return;
  }
  try {
    // เรียกใช้ Use Case เพื่อดึงข้อมูล Document
    const documents = await documentRepository.findAllByUserId(userId);
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
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
    return;
  }
};
