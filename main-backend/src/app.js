import express from "express";
import dotenv from "dotenv";
import { pool } from "./db.js";
import { listTables } from './db.js';
import cors from "cors";
dotenv.config();
const app = express();
const port = process.env.NODE_PORT || 5000;


app.use(
  cors({
    credentials: true,
    origin: ["http://localhost:3001"],
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
await pool.connect();
console.log("db connected");
app.get('/',async (req,res) => {
    try {
        const tables = await listTables();
        console.log("tables");
        tables.forEach((table) => {
            console.log(table.table_name);
        });
        res.status(200).json(tables);
    } catch (error) {
        console.error("Error fetching tables:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}
);          

app.listen(port, () => {
  console.log("server running on port", port);
});