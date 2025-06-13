import { Router } from "express";
import healthRoutes from './health.routes'; 
import debugRoutes from './debug.routes';
import authRoutes from './auth.routes';
import userRoutes from './user.routes'; 
const router = Router();

router.use('/api/v1',healthRoutes);
router.use('/api/v1/debug', debugRoutes);
router.use('/api/v1/auth', authRoutes);
router.use('/api/v1/user', userRoutes); 
export  default router;