import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import upload from "../middlewares/upload.middleware";
import {
  createFile,
  deleteFileById,
  getFileById,
  updateFile,
} from "../controllers/FileController";

const router = Router();

// router.post("/files", authMiddleware,upload.single('file'), createFile);
router.get("/files/:id", authMiddleware, getFileById);
router.patch("/files/:id", authMiddleware, updateFile);
router.delete("/files/:id", authMiddleware, deleteFileById);
export default router;
