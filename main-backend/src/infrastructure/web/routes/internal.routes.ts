import { Router } from "express";
import { updateFileStatusWebhook } from "../controllers/InternalController";

const router = Router()

router.patch('/files/status', updateFileStatusWebhook)
export default router;