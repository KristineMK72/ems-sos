// ~/ems-sos/backend/src/routes/incidents.js
import express from "express";
import { pool } from "../db.js";
const router = express.Router();

// Middleware to use the socket.io instance (attached to the Express app)
router.use((req, res, next) => {
    req.io = req.app.get('io');
    next();
});

// POST /api/incidents/sos (Create new incident)
router.post("/sos", async (req, res) => {
  const { lat, lng, description } = req.body;
  // User ID comes from the JWT verification middleware
  const userId = req.user.id;
  
  if (typeof lat !== 'number' || typeof lng !== 'number') {
    return res.status(400).json({ message: "Invalid coordinates" });
  }

  try {
    const result = await pool.query(
      "INSERT INTO incidents (user_id, lat, lng, description, status) VALUES ($1, $2, $3, $4, 'active') RETURNING *",
      [userId, lat, lng, description]
    );
    const incident = result.rows[0];

    // Emit the new incident to all connected dashboards via Socket.io
    if (req.io) {
        req.io.emit("incident:new", incident);
    }
    
    res.json(incident);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to send SOS" });
  }
});

// GET /api/incidents (Get all active incidents for dashboard)
router.get("/", async (req, res) => {
  try {
    // In a real app, you'd restrict this to EMS roles
    const result = await pool.query("SELECT * FROM incidents WHERE status='active' ORDER BY created_at DESC");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to retrieve incidents" });
  }
});

export default router;