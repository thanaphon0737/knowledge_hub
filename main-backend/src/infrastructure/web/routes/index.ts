import { Router } from "express";
import healthRoutes from './health.routes'; 
import debugRoutes from './debug.routes';
const router = Router();

router.use('/api/v1',healthRoutes);
router.use('/api/v1/debug', debugRoutes);
export  default router;