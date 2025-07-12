import axios from "axios";
import { IProcessingService } from "../../application/services/IProcessingService";
import "dotenv/config";
const AI_SERVICE_URL = process.env.AI_SERVICE_URL;
const WEBHOOK_URL = process.env.WEBHOOK_URL
export class AIServiceClient implements IProcessingService {
  public async startProcessing(fileInfo: {
    fileId: string;
    userId: string;
    documentId: string;
    sourceType: string;
    sourceLocation: string;
  }): Promise<void> {
    try {
      // โค้ดเรียก API จะอยู่ที่นี่ที่เดียว!
      console.log('initial main-backend --> ai-service process....')
      console.log(`call api: ${AI_SERVICE_URL}/api/v1/process`)
      console.log(`documentId: ${fileInfo.documentId}`)
      const result = await axios.post(`${AI_SERVICE_URL}/api/v1/process`, {
        file_id: fileInfo.fileId,
        user_id: fileInfo.userId,
        document_id: fileInfo.documentId,
        source_type: fileInfo.sourceType,
        source_location: fileInfo.sourceLocation,
        webhook_url: WEBHOOK_URL
        //...
      });
      
      console.log(
        `Successfully sent processing job for file: ${fileInfo.fileId}`
      );
    } catch (error) {
      console.error("Failed to call AI service", error);
      // อาจจะมีการจัดการ error เพิ่มเติม เช่น retry หรือแจ้งเตือน
      throw new Error("Failed to start AI processing");
    }
  }
}
