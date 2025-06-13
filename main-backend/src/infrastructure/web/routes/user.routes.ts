import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import { getUserProfile } from "../controllers/UserController";

const router = Router();

router.get('/me', authMiddleware,getUserProfile);
export default router;