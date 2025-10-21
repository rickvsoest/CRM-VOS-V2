import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';

// ... je andere imports (routers) ...

const app = express();

// ✅ CORS: kies dynamisch één geldige origin
const allowed = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean); // bv: ["https://vos-crm-v2.netlify.app"]

app.use((req, res, next) => {
  // Preflight: laat cors middleware het regelen
  next();
});

app.use(cors({
  origin(origin, cb) {
    // allow same-origin / server-to-server (no Origin)
    if (!origin) return cb(null, true);
    if (allowed.includes(origin)) return cb(null, true);
    return cb(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
}));

// Extra: preflight expliciet beantwoorden
app.options('*', cors({
  origin(origin, cb) {
    if (!origin) return cb(null, true);
    if (allowed.includes(origin)) return cb(null, true);
    return cb(new Error('CORS blocked'));
  },
  credentials: true,
}));

app.use(express.json({ limit: '2mb' }));
app.use(morgan('dev'));

// health
app.get('/health', (req, res) => {
  res.json({ ok: true, env: process.env.NODE_ENV || 'development', allowed });
});

// 🔗 je routers
// app.use('/auth', authRouter);
// app.use('/customers', customersRouter);
// app.use('/documents', documentsRouter);
// app.use('/address', addressRouter);

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`API :${port}`));
