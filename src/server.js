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

// --- BEGIN FINAL CORS FIX (Simplified for Public Access) ---
// Define the allowed public origin and local development environments
const publicOrigin = 'https://ems-sos.vercel.app'; 

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps/curl)
        if (!origin || origin === 'null') return callback(null, true);
        
        // Allow the public Vercel domain AND local dev environments
        if (origin === publicOrigin || origin.includes('localhost') || origin.includes('127.0.0.1')) {
            callback(null, true);
        } else {
            // This is the fallback for mobile devices and any other external IP
            // Note: In production, one would lock this down further.
            callback(null, true); 
        }
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS', // Include OPTIONS for preflight
    credentials: true, 
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
    // This warning is normal if the server is run from a different location
    console.warn("Migration check warning: Is PostgreSQL running?", e.message);
  }
});