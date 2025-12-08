// tests/auth.integration.test.js
import request from "supertest";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "../src/routes/authRoutes.js";
import pool from "../src/db.js";

// Load test env
dotenv.config({ path: ".env.test" });

// Setup Express app (same as server.js but without app.listen)
const app = express();
app.use(cors());
app.use(express.json());
app.use("/auth", authRoutes);

beforeAll(async () => {
  // Ensure test DB is clean
  await pool.query("DELETE FROM users");
});

afterAll(async () => {
  await pool.end(); // close DB connection
});

describe("Auth Service Integration Tests", () => {
  const testUser = {
    fullName: "John Doe",
    email: "john@example.com",
    password: "password123",
    role: "doctor",
    age: 35,
    gender: "male",
    birthday: "1990-01-01",
    mobile: "1234567890",
    mbbsReg: "MBBS123"
  };

  it("should register a new user", async () => {
    const res = await request(app).post("/auth/signup").send(testUser);

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("message", "User registered successfully");
  });

  it("should prevent duplicate signup", async () => {
    const res = await request(app).post("/auth/signup").send(testUser);

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("message", "User already exists");
  });

  it("should login an existing user", async () => {
    const res = await request(app).post("/auth/login").send({
      email: testUser.email,
      password: testUser.password,
    });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("token");
    expect(res.body.user).toMatchObject({
      fullName: "John Doe",
      email: "john@example.com",
      role: "doctor",
    });
  });

  it("should reject login with wrong password", async () => {
    const res = await request(app).post("/auth/login").send({
      email: testUser.email,
      password: "wrongpassword",
    });

    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty("message", "Invalid credentials");
  });
});
