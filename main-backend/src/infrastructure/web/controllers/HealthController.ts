import { Request, Response } from "express";
import { pool } from "../../database/db";

export const getHealthStatus = async (req: Request, res: Response) => {
  try {
    // Check database connection
    const dbResult = await pool.query("SELECT NOW()");
    if ((dbResult.rowCount ?? 0) > 0) {
      // If the database connection is successful, return a healthy status
      res.status(200).json({ status: "healthy" });
    }
  } catch (error) {
    console.error("Health check failed:", error);
    res
      .status(500)
      .json({ status: "unhealthy", error: "Database connection failed" });
  }
};
