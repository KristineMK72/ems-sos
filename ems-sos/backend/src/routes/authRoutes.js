// ~/ems-sos/backend/src/routes/authRoutes.js
import express from "express";
import { pool } from "../db.js";
import { hashPassword, comparePassword, createToken } from "../auth.js";
const router = express.Router();

// Register new user
router.post("/register", async (req, res) => {
  const { email, password, name } = req.body;
  if (!email || !password) return res.status(400).json({ message: "Missing email or password" });
  try {
    const hashed = await hashPassword(password);
    const result = await pool.query(
      "INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, email, name",
      [name || null, email, hashed]
    );
    const user = result.rows[0];
    const token = createToken(user);
    res.json({ user, token });
  } catch (err) {
    // Error 23505 is PostgreSQL unique violation (user already exists)
    if (err.code === '23505') {
        return res.status(409).json({ message: "User with this email already exists" });
    }
    console.error(err);
    res.status(500).json({ message: "Registration failed" });
  }
});

// Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: "Missing email or password" });
  try {
    const result = await pool.query("SELECT * FROM users WHERE email=$1", [email]);
    const user = result.rows[0];
    if (!user) return res.status(404).json({ message: "User not found" });

    const match = await comparePassword(password, user.password);
    if (!match) return res.status(401).json({ message: "Invalid credentials" });

    const token = createToken(user);
    res.json({ user: { id: user.id, name: user.name, email: user.email }, token });
  } catch (err) {
    res.status(500).json({ message: "Login failed" });
  }
});

export default router;