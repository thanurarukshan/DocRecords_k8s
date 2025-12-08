// backend/prescription-service/src/server.js

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import db from "./db.js"; // MySQL connection pool

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// ----------------- DEFAULT ROUTE -----------------
app.get("/", (req, res) => {
  res.send("Welcome to Prescription Service 🚀");
});

// ----------------- GET MEDICAL HISTORY -----------------
// Example: GET /medical-history/5 → all prescriptions for patient_id = 5
// GET MEDICAL HISTORY
app.get("/medical-history/:patientId", async (req, res) => {
  const { patientId } = req.params;

  try {
    const [rows] = await db.query(
      `SELECT consultation_id, visit_date, prescription, doctor_id
       FROM consultations
       WHERE patient_id = ?
       ORDER BY visit_date DESC`,
      [patientId]
    );

    res.json({ medicalHistory: rows });
  } catch (error) {
    console.error("Error fetching medical history:", error);
    res.status(500).json({ error: "Database query failed" });
  }
});


// ----------------- ADD NEW PRESCRIPTION -----------------
// Example POST body:
// {
//   "patient_id": 5,
//   "doctor_id": 2,
//   "prescription": "Paracetamol 500mg, Vitamin C 500mg"
// }
app.post("/add-prescription", async (req, res) => {
  const { patient_id, doctor_id, prescription } = req.body;

  if (!patient_id || !doctor_id || !prescription) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    // Insert the new prescription
    const [result] = await db.query(
      `INSERT INTO consultations (patient_id, doctor_id, prescription) 
       VALUES (?, ?, ?)`,
      [patient_id, doctor_id, prescription]
    );

    // Fetch updated medical history for that patient
    const [rows] = await db.query(
      `SELECT consultation_id, visit_date, prescription, doctor_id
      FROM consultations
      WHERE patient_id = ?
      ORDER BY visit_date DESC`,
      [patient_id]
    );


    res.status(201).json({
      message: "Prescription added successfully",
      consultation_id: result.insertId,
      medicalHistory: rows
    });
  } catch (error) {
    console.error("Error inserting prescription:", error);
    res.status(500).json({ error: "Database insert failed" });
  }
});

// ----------------- START SERVER -----------------
const PORT = process.env.PORT || 5004;
app.listen(PORT, () =>
  console.log(`Prescription service running on port ${PORT}`)
);
