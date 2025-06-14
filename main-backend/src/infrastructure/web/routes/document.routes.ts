import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import { createDocument } from "../controllers/DocumentController";

const router = Router();

router.post('/documents', authMiddleware,createDocument);
// Define other document-related routes here, e.g., getDocument, updateDocument, deleteDocument
// Example: router.get('/documents', authMiddleware, listDocuments);
// Example: router.get('/documents/:id', authMiddleware, getDocument);
// Example: router.patch('/documents/:id', authMiddleware, updateDocument);
// Example: router.delete('/documents/:id', authMiddleware, deleteDocument);
export default router;