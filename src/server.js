// ~/ems-sos/backend/src/server.js
import express from "express";
import cors from "cors";
import http from "http";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import incidents from "./routes/incidents.js";
import { verifyToken } from "./auth.js";
import { setupSocket } from "./socket.js";
import { pool } from "./db.js"; 
import fs from 'fs/promises';
import path from 'path';

dotenv.config();
const app = express();

// --- BEGIN FINAL CORS FIX ---
// Define the allowed frontend URLs (Vercel and local)
const allowedOrigins = [
    'https://ems-sos.vercel.app', // Your public Vercel domain (REQUIRED FOR LIVE APP)
    'http://localhost:3001',      // Your local development URL
    'http://localhost:8080'       // If you used port 8080
];

// Configure CORS middleware
app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            // Block requests from unknown origins
            const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
            return callback(new Error(msg), false);
        }
        // Allow the request
        return callback(null, true);
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true, // Allow JWT tokens/headers to be sent
}));
// --- END FINAL CORS FIX ---

app.use(express.json());

// Public Routes
app.use("/api/auth", authRoutes);

// Protected Routes (requires JWT)
app.use("/api/incidents", verifyToken, incidents);

// --- Server Setup ---
const server = http.createServer(app);
const io = setupSocket(server, app); // Initialize Socket.io and attach it to app

const PORT = process.env.PORT || 5000;

server.listen(PORT, async () => {
  console.log(`🚑 Server running on port ${PORT}`);
  
  // Attempt to create missing tables in dev (migration check)
  try {
    const sqlPath = path.resolve('migrations', 'init.sql');
    const sql = await fs.readFile(sqlPath, 'utf8');
    await pool.query(sql);
    console.log("Migration check complete (tables ensured)");
  } catch (e) {
    console.warn("Migration check warning: Is PostgreSQL running?", e.message);
  }
});