import {Pool} from 'pg';
import 'dotenv/config';

// export const pool = new Pool({
//     connectionString: process.env.DATABASE_URL
// });

// This is more reliable than using a single connectionString inside Docker.
export const pool = new Pool({
    host: process.env.DB_HOST,         // The service name from docker-compose.yml
    port: Number(process.env.DB_PORT), // Convert the port string to a number
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
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