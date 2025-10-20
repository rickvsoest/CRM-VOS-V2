// C:\Dev\Project-CRM-v2\backend\src\server.mjs
import express from "express";
import cors from "cors";

const app = express();

// 🔐 Zet dit in Railway als env: CORS_ORIGIN = https://<jouw-netlify-site>.netlify.app
const allowedOrigin = process.env.CORS_ORIGIN || "*";
app.use(cors({ origin: allowedOrigin, credentials: true }));
app.use(express.json());

// Healthcheck (open, voor test)
app.get("/health", (req, res) => {
  res.json({ ok: true, env: process.env.NODE_ENV || "development" });
});

// ... jouw routes hier ...

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`API listening on :${port}`);
});
