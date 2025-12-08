// src/server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pool from "./db.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Root route
app.get("/", (req, res) => {
  res.send("Welcome to profile-control-service API 🚀");
});


// ===================== USER ROUTES ===================== //

// Get user by ID
app.get("/users/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query("SELECT * FROM users WHERE user_id = ?", [id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


// Update user by ID
app.put("/users/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { email, full_name, age, gender, birthday, mobile, mbbs_reg } = req.body;

    const [result] = await pool.query(
      `UPDATE users 
       SET email = ?, full_name = ?, age = ?, gender = ?, birthday = ?, mobile = ?, mbbs_reg = ?
       WHERE user_id = ?`,
      [email, full_name, age, gender, birthday, mobile, mbbs_reg, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User updated successfully" });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


// Delete user by ID
app.delete("/users/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await pool.query("DELETE FROM users WHERE user_id = ?", [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ======================================================= //

const PORT = process.env.PORT || 5008;
app.listen(PORT, () => console.log(`profile-control-service running on port ${PORT}`));
