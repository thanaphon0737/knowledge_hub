import { Request, Response } from "express";
import {pool} from '../../database/db';

export const listAllTables = async (req: Request, res: Response): Promise<void> => {
    try {
        const result = await pool.query(`
            SELECT table_name
            FROM information_schema.tables
            WHERE table_schema = 'public'
        `);
        res.status(200).json(result.rows);
    } catch (error) {
        console.error("Error listing tables:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }

    
}

export const getTableSchema = async (req: Request, res: Response): Promise<void> => {
    const tableName = req.params.tableName;
    try {
        const result = await pool.query(`
            SELECT column_name, data_type
            FROM information_schema.columns
            WHERE table_name = $1
        `, [tableName]);
        res.status(200).json(result.rows);
    } catch (error) {
        console.error(`Error getting schema for table ${tableName}:`, error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};