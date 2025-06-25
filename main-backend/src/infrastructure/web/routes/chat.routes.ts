import { Router } from "express";
import {handleUserQuery } from '../controllers/ChatController';
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

router.post('/query', authMiddleware, handleUserQuery);

export default router;