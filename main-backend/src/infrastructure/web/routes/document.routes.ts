import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import { createDocument } from "../controllers/DocumentController";
import { getDocumentById, getDocuments } from "../controllers/DocumentController";
import { updateDocument } from "../controllers/DocumentController";
import { deleteDocument } from "../controllers/DocumentController";
import { deleteFilesByDocumentId, getFileByDocumentId } from "../controllers/FileController";

const router = Router();

router.post('/documents', authMiddleware,createDocument);
// Define other document-related routes here, e.g., getDocument, updateDocument, deleteDocument
router.get('/documents', authMiddleware, getDocuments);
router.get('/documents/:id', authMiddleware, getDocumentById);
router.get('/documents/:documentId/files',authMiddleware,getFileByDocumentId);

router.patch('/documents/:id', authMiddleware, updateDocument);

router.delete('/documents/:id', authMiddleware, deleteDocument);
router.delete('/documents/:documentId/files',authMiddleware,deleteFilesByDocumentId)
export default router;