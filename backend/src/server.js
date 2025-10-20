import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { PrismaClient } from '@prisma/client';

import customersRouter from './routes/customers.js';
import documentsRouter from './routes/documents.js';
import addressRouter from './routes/address.js';

const app = express();
const prisma = new PrismaClient();

const PORT = process.env.PORT || 5000;
const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';
const express = require("express");
const cors = require("cors");

const allowedOrigin = process.env.CORS_ORIGIN || "*";
app.use(cors({ origin: allowedOrigin, credentials: true }));
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ ok: true, env: process.env.NODE_ENV || "development" });
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`API listening on :${port}`));

app.use(cors({ origin: CORS_ORIGIN, credentials: true }));
app.use(express.json({ limit: '2mb' }));
app.use(morgan('dev'));

// Health
app.get('/health', (req, res) => res.json({ ok: true }));

// Routes
app.use('/customers', customersRouter);
app.use('/documents', documentsRouter);
app.use('/address', addressRouter);

// 404
app.use((req, res) => res.status(404).json({ error: 'Not found' }));

// Start
app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
});
