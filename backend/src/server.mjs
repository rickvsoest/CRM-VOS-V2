import express from 'express';
import cors from 'cors';
import authRouter from './routes/auth.js';     // <— exact één keer importeren
// import invitesRouter from './routes/invites.js'; // als je die hebt, oké: maar let op dubbele mounts

const app = express();

// CORS allow-list
const allowedOrigins = [
  'https://vos-crm-v2.netlify.app',
  'http://localhost:5173'
];

const corsOptions = {
  origin(origin, cb) {
    if (!origin) return cb(null, true);
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

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.get('/health', (_req, res) => res.json({ ok: true }));

// === ROUTES (mount elk maar 1x) ===
app.use('/auth', authRouter);           // => POST /auth/login
// app.use('/invites', invitesRouter);  // => alleen als je invites hebt

// === ERROR HANDLER (laatste) ===
app.use((err, req, res, _next) => {
  console.error('Unhandled error:', err?.message || err);
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
  }
  res.status(500).json({ message: 'Interne serverfout.' });
});

// START
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`API listening on :${PORT}`);
});
