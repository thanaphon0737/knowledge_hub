import axios from "axios";
import { IProcessingService } from "../../application/services/IProcessingService";
import "dotenv/config";
import { supabase } from "../database/storage"; // Import Supabase client
const AI_SERVICE_URL = process.env.AI_SERVICE_URL;
const WEBHOOK_URL = process.env.WEBHOOK_URL;
export class AIServiceClient implements IProcessingService {
  public async startProcessing(fileInfo: {
    fileId: string;
    userId: string;
    documentId: string;
    sourceType: string;
    sourceLocation: string;
  }): Promise<any> {
    try {
      // โค้ดเรียก API จะอยู่ที่นี่ที่เดียว!
      console.log("initial main-backend --> ai-service process....");
      console.log(`call api: ${AI_SERVICE_URL}/api/v1/process`);
      console.log(`documentId: ${fileInfo.documentId}`);

      // Determine the source location to send to AI service
      // - For 'upload': create a signed URL from Supabase Storage path
      // - For 'url': pass through the original URL as-is (no signing)
      let sourceLocationToSend = fileInfo.sourceLocation;
      if (fileInfo.sourceType === "upload") {
        const bucketName = "knowledge-files";
        // Generate a URL that is valid for 5 minutes (300 seconds)
        const { data, error } = await supabase.storage
          .from(bucketName)
          .createSignedUrl(fileInfo.sourceLocation, 300);

        if (error) throw error;
        sourceLocationToSend = data.signedUrl;
        console.log("Using signed URL for uploaded file from Supabase storage.");
      } else if (fileInfo.sourceType === "url") {
        console.log("Using direct URL source (no signing required).");
      } else {
        console.log(`Unrecognized sourceType '${fileInfo.sourceType}', passing sourceLocation as-is.`);
      }

      const result = await axios.post(`${AI_SERVICE_URL}/api/v1/process`, {
        file_id: fileInfo.fileId,
        user_id: fileInfo.userId,
        document_id: fileInfo.documentId,
        source_type: fileInfo.sourceType,
        source_location: sourceLocationToSend,
        webhook_url: WEBHOOK_URL,
        //...
      });

      console.log(
        `Successfully sent processing job for file: ${fileInfo.fileId}`
      );
      return result.data; // Assuming the API returns some data
    } catch (error) {
      console.error("Failed to call AI service", error);
      // อาจจะมีการจัดการ error เพิ่มเติม เช่น retry หรือแจ้งเตือน
      throw new Error("Failed to start AI processing");
    }
  }
}
