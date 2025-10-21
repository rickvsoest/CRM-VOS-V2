// backend/src/server.mjs
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';

import customersRouter from './routes/customers.js';
import documentsRouter from './routes/documents.js';
import addressRouter from './routes/address.js';

const app = express();

const allowedOrigin = process.env.CORS_ORIGIN || '*';
app.use(cors({ origin: allowedOrigin, credentials: true }));
app.use(express.json({ limit: '2mb' }));
app.use(morgan('dev'));

app.get('/health', (req, res) => {
  res.json({ ok: true, env: process.env.NODE_ENV || 'development' });
});

app.use('/customers', customersRouter);
app.use('/documents', documentsRouter);
app.use('/address', addressRouter);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`API listening on :${port}`);
});
