// ~/ems-sos/backend/src/db.js
import pkg from "pg";
import dotenv from "dotenv";

dotenv.config();
const { Pool } = pkg;

export const pool = new Pool({
  user: process.env.POSTGRES_USER,
  host: process.env.POSTGRES_HOST || "localhost",
  database: process.env.POSTGRES_DB,
  password: process.env.POSTGRES_PASSWORD,
  port: process.env.POSTGRES_PORT || 5432,
});

pool.on("connect", () => {
  console.log("✅ Connected to PostgreSQL database");
});