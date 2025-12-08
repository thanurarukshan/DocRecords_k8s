// import express from "express";
// import { createProxyMiddleware } from "http-proxy-middleware";

// const app = express();

// // ---------- AUTH SERVICE ----------
// app.use(
//   "/auth",
//   createProxyMiddleware({
//     target: "http://localhost:5001", // auth-service
//     changeOrigin: true,
//   })
// );

// // ---------- PATIENT SERVICE ----------
// app.use(
//   "/patient",
//   createProxyMiddleware({
//     target: "http://localhost:5000", // patient-service
//     changeOrigin: true,
//     pathRewrite: { "^/patient": "" },
//   })
// );

// // ---------- DOCTOR SERVICE ----------
// app.use(
//   "/doctor",
//   createProxyMiddleware({
//     target: "http://localhost:5003", // doctor-service
//     changeOrigin: true,
//     pathRewrite: { "^/doctor": "" },
//   })
// );

// // ---------- APPOINTMENT SERVICE ----------
// app.use(
//   "/appointment",
//   createProxyMiddleware({
//     target: "http://localhost:5004", // appointment-service
//     changeOrigin: true,
//     pathRewrite: { "^/appointment": "" },
//   })
// );

// // ---------- PRESCRIPTION SERVICE ----------
// app.use(
//   "/prescription",
//   createProxyMiddleware({
//     target: "http://localhost:5004", // prescription-service
//     changeOrigin: true,
//     pathRewrite: { "^/prescription": "" }, // /prescription/... → /...
//   })
// );

// // ---------- PROFILE CONTROL SERVICE ----------
// app.use(
//   "/profile",
//   createProxyMiddleware({
//     target: "http://localhost:5008", // profile-control-service
//     changeOrigin: true,
//     pathRewrite: { "^/profile": "" }, // /profile/update → /update
//   })
// );

// app.listen(4000, () => {
//   console.log("API Gateway running on port 4000");
// });


import express from "express";
import { createProxyMiddleware } from "http-proxy-middleware";

const app = express();

// ---------- AUTH SERVICE ----------
app.use(
  "/auth",
  createProxyMiddleware({
    target: "http://auth-service:5001", // use container hostname
    changeOrigin: true,
  })
);

// ---------- PATIENT SERVICE ----------
app.use(
  "/patient",
  createProxyMiddleware({
    target: "http://patient-service:5000", // use container hostname
    changeOrigin: true,
    pathRewrite: { "^/patient": "" },
  })
);

// ---------- DOCTOR SERVICE ----------
app.use(
  "/doctor",
  createProxyMiddleware({
    target: "http://doctor-service:5003", // use container hostname
    changeOrigin: true,
    pathRewrite: { "^/doctor": "" },
  })
);

// ---------- APPOINTMENT SERVICE ----------
app.use(
  "/appointment",
  createProxyMiddleware({
    target: "http://appointment-service:5004", // use container hostname
    changeOrigin: true,
    pathRewrite: { "^/appointment": "" },
  })
);

// ---------- PRESCRIPTION SERVICE ----------
app.use(
  "/prescription",
  createProxyMiddleware({
    target: "http://prescription-service:5004", // use container hostname
    changeOrigin: true,
    pathRewrite: { "^/prescription": "" },
  })
);

// ---------- PROFILE CONTROL SERVICE ----------
app.use(
  "/profile",
  createProxyMiddleware({
    target: "http://profile-control-service:5008", // use container hostname
    changeOrigin: true,
    pathRewrite: { "^/profile": "" },
  })
);

app.listen(4000, () => {
  console.log("API Gateway running on port 4000");
});
