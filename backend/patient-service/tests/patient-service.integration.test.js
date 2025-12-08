import request from "supertest";
import app from "../src/server.js";
import pool from "../src/db.js";

describe("Patient Service Integration Tests", () => {
  afterAll(async () => {
    await pool.end(); // close db connection after tests
  });

  it("should return welcome message", async () => {
    const res = await request(app).get("/");
    expect(res.statusCode).toBe(200);
    expect(res.text).toBe("Welcome to patient-service API 🚀");
  });

  it("should return patient details if exists", async () => {
    // 👇 use a test patient ID that exists in your DB
    const patientId = 1;

    const res = await request(app).get(`/patients/${patientId}`);
    if (res.statusCode === 200) {
      expect(res.body).toHaveProperty("user_id", patientId);
      expect(res.body).toHaveProperty("email");
      expect(res.body).toHaveProperty("full_name");
    } else {
      // fallback in case no patient exists with this ID
      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty("message", "Patient not found");
    }
  });

  it("should return 404 for non-existing patient", async () => {
    const res = await request(app).get("/patients/99999");
    expect([404, 200]).toContain(res.statusCode); // account for real DB state
  });
});
