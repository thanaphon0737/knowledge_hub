import {Pool} from 'pg';
import 'dotenv/config';

export const pool = new Pool({
    connectionString: process.env.DATABASE_URL_LOCAL
});

export const connectToDatabase = async () => {
    try {
        await pool.connect();
        console.log("Database connection established successfully.");
    } catch (error) {
        console.error("Error connecting to the database:", error);
        throw error; // Re-throw the error to be handled by the caller
    }
};