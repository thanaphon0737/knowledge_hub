import { Router } from "express";
import healthRoutes from './health.routes'; 
import debugRoutes from './debug.routes';
import authRoutes from './auth.routes';
import userRoutes from './user.routes'; 
import documentRoutes from './document.routes';
import fileRoutes from './file.routes';
import internalRoutes from './internal.routes';

const router = Router();

router.use('/api/v1',healthRoutes);
router.use('/api/v1/debug', debugRoutes);
router.use('/api/v1/auth', authRoutes);
router.use('/api/v1/user', userRoutes); 
router.use('/api/v1',documentRoutes);
router.use('/api/v1',fileRoutes);

router.use('/api/v1/internal',internalRoutes);
export  default router;