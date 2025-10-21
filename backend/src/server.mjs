import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import authRouter from './routes/auth.js';
import invitesRouter from './routes/invites.js';

// ⬇️ deze import moet bestaan
import authRouter from './routes/auth.js';
// (eventueel ook andere routers)
// import customersRouter from './routes/customers.js';
// import documentsRouter from './routes/documents.js';
// import addressRouter from './routes/address.js';

const app = express();

// ... jouw CORS + middleware ...

app.use(express.json({ limit: '2mb' }));
app.use(morgan('dev'));
app.use('/auth', authRouter);
app.use('/invites', invitesRouter);

app.get('/health', (req, res) => {
  res.json({ ok: true });
});

// ⬇️ deze mount moet bestaan
app.use('/auth', authRouter);

// andere routers
// app.use('/customers', customersRouter);
// app.use('/documents', documentsRouter);
// app.use('/address', addressRouter);

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`API listening on :${port}`));
