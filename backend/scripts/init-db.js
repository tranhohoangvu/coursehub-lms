import dotenv from "dotenv";
dotenv.config();

import fs from "fs";
import path from "path";
import pg from "pg";
import { fileURLToPath } from "url";

const { Pool } = pg;

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DB_SSL === "false" ? false : { rejectUnauthorized: false },
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const schemaPath = path.join(__dirname, "..", "sql", "schema.sql");
const schema = fs.readFileSync(schemaPath, "utf8");

if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is missing. Please check backend/.env");
}

await pool.query(schema);
console.log("Database schema created successfully.");
await pool.end();