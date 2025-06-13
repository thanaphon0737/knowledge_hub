import { Router } from "express";
import healthRoutes from './health.routes'; 

const router = Router();

router.use('/api/v1',healthRoutes);

export  default router;