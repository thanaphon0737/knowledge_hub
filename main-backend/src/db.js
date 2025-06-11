import { error } from "console";
import dotenv from "dotenv";
import pg from "pg";
const { Pool } = pg;
dotenv.config();
// when using a docker container, the DATABASE_URL environment variable is set by the docker-compose file.
const connectionString = process.env.DATABASE_URL;
// If you are using a local PostgreSQL database, you can uncomment the following line and comment the DATABASE_URL line.
// const connectionString = `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`;
 console.log(`Connecting to database at ${connectionString}`);
if (!process.env.DB_USER || !process.env.DB_PASSWORD || !process.env.DB_HOST || !process.env.DB_PORT || !process.env.DB_NAME) {
  throw new Error("Database connection environment variables are not set.");
}
export const pool = new Pool({
  connectionString,
})
// This will log the connection string to the console for debugging purposes.
export const listTables = async () => {
  try {
    const query = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `;
    const result = await pool.query(query);
    return result.rows;
  } catch (err) {
    console.error('Error listing tables:', err);
    throw err;
  }
};

