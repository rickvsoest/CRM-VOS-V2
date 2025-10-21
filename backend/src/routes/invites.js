import { Router } from 'express';
import crypto from 'crypto';
import { PrismaClient } from '@prisma/client';
import { sendInviteEmail } from '../utils/mailer.js';

const prisma = new PrismaClient();
const router = Router();

/**
 * POST /invites
 * body: { email, role?, customerId? }
 * -> maakt invite aan en mailt link: FRONTEND_URL/register?token=...
 */
router.post('/', async (req, res) => {
  try {
    const { email, role = 'KLANT', customerId } = req.body || {};
    if (!email) return res.status(400).json({ message: 'email verplicht' });

    const token = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await prisma.userInvite.create({
      data: { email, role, customerId: customerId || null, tokenHash, expiresAt },
    });

    const frontend = process.env.FRONTEND_URL || 'https://vos-crm-v2.netlify.app';
    const link = `${frontend}/register?token=${token}`;

    await sendInviteEmail({ to: email, link });

    return res.json({ ok: true });
  } catch (err) {
    console.error('create invite error:', err);
    return res.status(500).json({ message: 'Kon uitnodiging niet sturen' });
  }
});

/**
 * GET /invites/validate?token=...
 * -> geeft { email, role } terug indien geldig
 */
router.get('/validate', async (req, res) => {
  try {
    const { token } = req.query || {};
    if (!token) return res.status(400).json({ message: 'token verplicht' });
    const tokenHash = crypto.createHash('sha256').update(String(token)).digest('hex');

    const inv = await prisma.userInvite.findUnique({ where: { tokenHash } });
    if (!inv || inv.usedAt || inv.expiresAt < new Date())
      return res.status(410).json({ message: 'Invite ongeldig of verlopen' });

    return res.json({ email: inv.email, role: inv.role });
  } catch (err) {
    return res.status(500).json({ message: 'Fout bij valideren' });
  }
});

export default router;
