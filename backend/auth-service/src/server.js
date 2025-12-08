
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import pool from "./db.js";

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/auth", authRoutes);

// Test route
app.get("/", (req, res) => {
  res.send("Auth Service is running 🚀");
});

// Test DB connection on startup
(async () => {
  try {
    const connection = await pool.getConnection();
    console.log("✅ Connected to MySQL Database:", process.env.DB_NAME);
    connection.release();
  } catch (err) {
    console.error("❌ Database connection failed:", err.message);
  }
})();

// Start server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`🚀 Auth Service running on port ${PORT}`);
});
