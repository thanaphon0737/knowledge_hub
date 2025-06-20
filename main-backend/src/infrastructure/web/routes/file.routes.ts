import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import { createFile } from "../controllers/FileController";

const router = Router();

router.post('/files', authMiddleware, createFile);

export default router;