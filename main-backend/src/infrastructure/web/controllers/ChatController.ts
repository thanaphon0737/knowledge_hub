import { RequestHandler } from "express";
import axios from "axios";
import "dotenv/config";
const AI_SERVICE_URL_QUERY_URL = process.env.AI_SERVICE_URL_QUERY_URL;

export const handleUserQuery: RequestHandler = async (req, res) => {
  const user = req.user;
  const { question, documentId } = req.body;
  if (!user) {
    res.status(401).json({ message: "Unauthorize" });
    return;
  }
  if (!question) {
    res.status(400).json({ success: false, message: "Question is required." });
    return;
  }
  if(!documentId){
    res.status(404).json({success: false, message: "documentId not found."})
  }
  if (!AI_SERVICE_URL_QUERY_URL) {
    res.status(500).json({ success: false, message: "AI service URL is not configured." });
    return;
  }
  console.log(`frontend body send for query: ${req.body.question} ${req.body.document_id}`)
  try {
    console.log(`Forwarding query to AI service for user: ${user.id}`);
    
    const aiResponse = await axios.post(AI_SERVICE_URL_QUERY_URL, {
      user_id: user.id,
      document_id: documentId,
      question: question,
    //   document_ids: document_ids,
    });

    res.status(200).json(aiResponse.data);
  } catch (error: any) {
    console.error("Error forwarding request to AI service: ", error.message);

    const statusCode = error.response?.status || 500;
    const message = error.response?.data?.details || "Error with AI service";
    res.status(statusCode).json({ success: false, message: message });
  }
};
