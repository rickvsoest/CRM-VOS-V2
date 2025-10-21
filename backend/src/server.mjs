import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';

// import je routers...
// import authRouter from './routes/auth.js';
// import customersRouter from './routes/customers.js';
// import documentsRouter from './routes/documents.js';
// import addressRouter from './routes/address.js';

const app = express();

// ✅ Toegestane origins uit env (kommagescheiden)
const allowed = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

// ✅ Dynamische CORS (géén '*' wildcard routes gebruiken in Express v5)
const corsOptions = {
  origin(origin, cb) {
    if (!origin) return cb(null, true);               // server-to-server / curl
    if (allowed.includes(origin)) return cb(null, true);
    return cb(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
};

// Gebruik één cors-middleware vroeg in de pipeline
app.use(cors(corsOptions));

// ⚠️ Verwijder deze regel als je ‘m nog had:
// app.options('*', cors(corsOptions));  // ❌ NIET in Express v5

app.use(express.json({ limit: '2mb' }));
app.use(morgan('dev'));

app.get('/health', (req, res) => {
  res.json({ ok: true, env: process.env.NODE_ENV || 'development', allowed });
});

// Routers
// app.use('/auth', authRouter);
// app.use('/customers', customersRouter);
// app.use('/documents', documentsRouter);
// app.use('/address', addressRouter);

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`API listening on :${port}`));
