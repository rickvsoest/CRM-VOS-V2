import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = Router();

const uploadDir = process.env.UPLOAD_DIR || './uploads';
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ts = Date.now();
    const safe = file.originalname.replace(/[^\w.\-]/g, '_');
    cb(null, `${ts}_${safe}`);
  }
});
const upload = multer({ storage });

/** GET /documents?customerId=... */
router.get('/', async (req, res) => {
  const customerId = req.query.customerId?.toString();
  const where = customerId ? { customerId } : {};
  const items = await prisma.document.findMany({ where, orderBy: { createdAt: 'desc' } });
  res.json({ items });
});

/** POST /documents (multipart) fields: customerId, file */
router.post('/', upload.single('file'), async (req, res) => {
  const customerId = req.body.customerId;
  if (!customerId || !req.file) return res.status(400).json({ error: 'customerId en file verplicht' });

  const doc = await prisma.document.create({
    data: {
      customerId,
      originalName: req.file.originalname,
      fileName: path.basename(req.file.filename),
      mimeType: req.file.mimetype,
      size: req.file.size,
      path: path.join(uploadDir, req.file.filename)
    }
  });
  res.status(201).json(doc);
});

/** GET /documents/:id/download */
router.get('/:id/download', async (req, res) => {
  const doc = await prisma.document.findUnique({ where: { id: req.params.id } });
  if (!doc) return res.status(404).json({ error: 'Not found' });
  if (!fs.existsSync(doc.path)) return res.status(410).json({ error: 'File gone' });
  res.download(doc.path, doc.originalName);
});

/** DELETE /documents/:id */
router.delete('/:id', async (req, res) => {
  const doc = await prisma.document.findUnique({ where: { id: req.params.id } });
  if (!doc) return res.status(404).json({ error: 'Not found' });
  await prisma.document.delete({ where: { id: req.params.id } });
  try { fs.unlinkSync(doc.path); } catch {}
  res.json({ ok: true });
});

export default router;
