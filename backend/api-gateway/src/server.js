import express from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import dotenv from "dotenv";

dotenv.config();

const app = express();

// ---------- AUTH SERVICE ----------
app.use(
  "/auth",
  createProxyMiddleware({
    target: process.env.AUTH_SERVICE_URL || "http://localhost:5001",
    changeOrigin: true,
  })
);

// ---------- PATIENT SERVICE ----------
app.use(
  "/patient",
  createProxyMiddleware({
    target: process.env.PATIENT_SERVICE_URL || "http://localhost:5000",
    changeOrigin: true,
    pathRewrite: { "^/patient": "" },
  })
);

// ---------- DOCTOR SERVICE ----------
app.use(
  "/doctor",
  createProxyMiddleware({
    target: process.env.DOCTOR_SERVICE_URL || "http://localhost:5003",
    changeOrigin: true,
    pathRewrite: { "^/doctor": "" },
  })
);

// ---------- APPOINTMENT SERVICE ----------
app.use(
  "/appointment",
  createProxyMiddleware({
    target: process.env.APPOINTMENT_SERVICE_URL || "http://localhost:5004",
    changeOrigin: true,
    pathRewrite: { "^/appointment": "" },
  })
);

// ---------- PRESCRIPTION SERVICE ----------
app.use(
  "/prescription",
  createProxyMiddleware({
    target: process.env.PRESCRIPTION_SERVICE_URL || "http://localhost:5004",
    changeOrigin: true,
    pathRewrite: { "^/prescription": "" },
  })
);

// ---------- PROFILE CONTROL SERVICE ----------
app.use(
  "/profile",
  createProxyMiddleware({
    target: process.env.PROFILE_SERVICE_URL || "http://localhost:5008",
    changeOrigin: true,
    pathRewrite: { "^/profile": "" },
  })
);

app.listen(4000, () => {
  console.log("API Gateway running on port 4000");
});
