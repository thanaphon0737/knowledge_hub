import { Router } from "express";
import { getHealthStatus } from '../controllers/HealthController';

const router = Router();

router.get('/health', getHealthStatus);
export default router;