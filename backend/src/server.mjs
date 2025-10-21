import express from 'express';
import cors from 'cors';
import authRouter from './routes/auth.js';

const app = express();

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
});
