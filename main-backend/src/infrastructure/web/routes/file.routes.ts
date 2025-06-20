import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import { createFile, getFileById,updateFile } from "../controllers/FileController";

const router = Router();

router.post("/files", authMiddleware, createFile);
router.get("/files/:id", authMiddleware, getFileById);
router.patch("/files/:id", authMiddleware, updateFile)
export default router;
