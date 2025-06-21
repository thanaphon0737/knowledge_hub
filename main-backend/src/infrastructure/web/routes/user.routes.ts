import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import { getUserProfile } from "../controllers/UserController";
import { deleteFilesByUserId } from "../controllers/FileController";

const router = Router();

router.get('/me', authMiddleware,getUserProfile);

router.delete('/me/files',authMiddleware,deleteFilesByUserId)
export default router;