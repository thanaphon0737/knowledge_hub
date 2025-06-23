import axios from "axios";
import { IProcessingService } from "../../application/services/IProcessingService";
import "dotenv/config";
const AISERVICE_URL = process.env.AISERVICE_URL;
export class AIServiceClient implements IProcessingService {
  public async startProcessing(fileInfo: {
    fileId: string;
    userId: string;
    sourceType: string;
    sourceLocation: string;
  }): Promise<void> {
    try {
      // โค้ดเรียก API จะอยู่ที่นี่ที่เดียว!
      await axios.post(`${AISERVICE_URL}/api/v1/process`, {
        file_id: fileInfo.fileId,
        user_id: fileInfo.userId,
        source_type: fileInfo.sourceType,
        source_location: fileInfo.sourceLocation
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
