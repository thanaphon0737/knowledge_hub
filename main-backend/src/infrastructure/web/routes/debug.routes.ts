import { Router } from "express";
import { listAllTables,getTableSchema } from "../controllers/DebugController";

const router = Router();
// Define the route to list all tables
router.get('/tables', listAllTables);
router.get('/tables/:tableName', getTableSchema);
// Export the router
export default router;