import express from 'express';
import cors from 'cors';
import authRouter from './routes/auth.js';
import { PrismaClient } from '@prisma/client';
import customersRouter from './routes/customers.js';
import documentsRouter from './routes/documents.js';
import invitesRouter from './routes/invites.js';
import addressRouter from './routes/address.js';

const app = express();
const prisma = new PrismaClient();

const allowedOrigins = [
  'https://vos-crm-v2.netlify.app',
  'http://localhost:5173'
];

const corsOptions = {
  origin(origin, cb) {
    if (!origin) return cb(null, true);                // server-to-server / curl
    if (allowedOrigins.includes(origin)) return cb(null, true);
    return cb(new Error('Not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400
};

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get('/health', (_req, res) => res.json({ ok: true, time: new Date().toISOString() }));
app.get('/api/health', (_req, res) => res.json({ ok: true, time: new Date().toISOString() }));


// ✅ CORS vóór routes
app.use(cors(corsOptions));

// ❌ VERWIJDER deze regel als je 'm had (Express 5 breekt hierop):
// app.options('*', cors(corsOptions));

// ✅ Optioneel: generieke OPTIONS handler (werkt in Express 5)
app.use((req, res, next) => {
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

// Health
app.get('/health', (_req, res) => res.json({ ok: true }));

// Routes (let op: mount elk maar één keer)
app.use('/auth', authRouter);

// Fallback error handler
app.use((err, req, res, _next) => {
  console.error('Unhandled error:', err?.message || err);
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
  }
  res.status(500).json({ message: 'Interne serverfout.' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`API listening on :${PORT}`);

app.use('/api/auth', authRouter);
app.use('/api/customers', customersRouter);
app.use('/api/documents', documentsRouter);
app.use('/api/invites', invitesRouter);
app.use('/api/address', addressRouter);

  // Extra health check voor DB
app.get('/health/db', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ ok: true });
  } catch (e) {
    console.error('[health/db] error', e);
    res.status(500).json({ ok: false, error: 'db' });
  }
});



});
