import request from "supertest";
import { spawn } from "child_process";
import mysql from "mysql2/promise";

const BASE_URL = "http://localhost:5008";
let serverProcess;
let pool;
let testUserId;

beforeAll(async (done) => {
  // 1. Start server.js as a child process
  serverProcess = spawn("node", ["src/server.js"], {
    stdio: "inherit", // show server logs in console
  });

  // 2. Wait a bit for server to start
  setTimeout(done, 2000);

  // 3. Setup DB connection (use same creds as in src/db.js)
  pool = await mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASS || "",
    database: process.env.DB_NAME || "docrecords",
  });

  // 4. Insert a test user
  const [result] = await pool.query(
    `INSERT INTO users (email, full_name, age, gender, birthday, mobile, mbbs_reg)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      "integration@example.com",
      "Integration User",
      28,
      "M",
      "1996-01-01",
      "0712345678",
      "MBBS1234",
    ]
  );
  testUserId = result.insertId;
}, 10000); // allow up to 10s for setup

afterAll(async () => {
  // Delete test user if still exists
  if (testUserId) {
    await pool.query("DELETE FROM users WHERE user_id = ?", [testUserId]);
  }

  // Close DB connection
  await pool.end();

  // Kill server process
  if (serverProcess) {
    serverProcess.kill();
  }
});

describe("Profile Control Service Integration Tests", () => {
  test("GET / should return welcome message", async () => {
    const res = await request(BASE_URL).get("/");
    expect(res.statusCode).toBe(200);
    expect(res.text).toBe("Welcome to profile-control-service API 🚀");
  });

  test("GET /users/:id should return user", async () => {
    const res = await request(BASE_URL).get(`/users/${testUserId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.full_name).toBe("Integration User");
    expect(res.body.email).toBe("integration@example.com");
  });

  test("GET /users/:id should return 404 for non-existing user", async () => {
    const res = await request(BASE_URL).get("/users/99999999");
    expect(res.statusCode).toBe(404);
    expect(res.body.message).toBe("User not found");
  });

  test("PUT /users/:id should update user", async () => {
    const res = await request(BASE_URL)
      .put(`/users/${testUserId}`)
      .send({
        email: "updated@example.com",
        full_name: "Updated User",
        age: 29,
        gender: "M",
        birthday: "1995-01-01",
        mobile: "0776543210",
        mbbs_reg: "MBBS5678",
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("User updated successfully");

    // Verify update in DB
    const [rows] = await pool.query("SELECT * FROM users WHERE user_id = ?", [
      testUserId,
    ]);
    expect(rows[0].email).toBe("updated@example.com");
    expect(rows[0].full_name).toBe("Updated User");
  });

  test("DELETE /users/:id should delete user", async () => {
    const res = await request(BASE_URL).delete(`/users/${testUserId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("User deleted successfully");

    // Verify user gone
    const [rows] = await pool.query("SELECT * FROM users WHERE user_id = ?", [
      testUserId,
    ]);
    expect(rows.length).toBe(0);

    // Prevent afterAll from re-deleting
    testUserId = null;
  });
});
