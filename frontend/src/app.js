import express from 'express';
import cors from 'cors';
import authRouter from './routes/auth.js';
// ... import andere routers

const app = express();

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// CORS (pas origins desgewenst aan)
app.use(cors({
  origin: true, // of: ['https://jouw-netlify-site.netlify.app']
  credentials: true
}));

// Health check
app.get('/health', (_req, res) => res.json({ ok: true }));

// MOUNT ROUTES — let op je prefix!
app.use('/auth', authRouter); // -> POST /auth/login
// app.use('/api/auth', authRouter); // Als je /api wilt gebruiken

export default app;
