import request from "supertest";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import db from "../src/db.js"; // MySQL connection pool
import bodyParser from "body-parser";

// note: add prescription may fails due to patient it and doctor id may not avilable in users tables

// Load environment variables (use .env or .env.test)
dotenv.config();

// Setup Express app (like server.js but without app.listen)
const app = express();
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

// ----------------- Routes from server.js -----------------
app.get("/", (req, res) => res.send("Welcome to Prescription Service 🚀"));

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

app.post("/add-prescription", async (req, res) => {
  const { patient_id, doctor_id, prescription } = req.body;

  if (!patient_id || !doctor_id || !prescription) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const [result] = await db.query(
      `INSERT INTO consultations (patient_id, doctor_id, prescription) 
       VALUES (?, ?, ?)`,
      [patient_id, doctor_id, prescription]
    );

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

// ----------------- Tests -----------------
beforeAll(async () => {
  // Clean test DB (optional)
  await db.query("DELETE FROM consultations");
});

afterAll(async () => {
  await db.end(); // close DB connection
});

describe("Prescription Service Integration Tests", () => {
  const testPrescription = {
    patient_id: 1,
    doctor_id: 1,
    prescription: "Paracetamol 500mg"
  };

  it("should add a new prescription", async () => {
    const res = await request(app).post("/add-prescription").send(testPrescription);

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("message", "Prescription added successfully");
    expect(res.body).toHaveProperty("consultation_id");
    expect(res.body.medicalHistory[0]).toMatchObject({
      patient_id: testPrescription.patient_id,
      doctor_id: testPrescription.doctor_id,
      prescription: testPrescription.prescription
    });
  });

  it("should return medical history for a patient", async () => {
    const res = await request(app).get(`/medical-history/${testPrescription.patient_id}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("medicalHistory");
    expect(res.body.medicalHistory.length).toBeGreaterThan(0);
    expect(res.body.medicalHistory[0]).toHaveProperty("prescription", testPrescription.prescription);
  });

  it("should fail to add prescription with missing fields", async () => {
    const res = await request(app).post("/add-prescription").send({
      patient_id: 1,
      doctor_id: 1
    });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("error", "Missing required fields");
  });
});
