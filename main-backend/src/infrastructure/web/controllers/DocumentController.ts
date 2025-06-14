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


