// backend/src/routes/auth.js
import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import { login } from '../controllers/authController.js';

const prisma = new PrismaClient();
const router = Router();

// POST /auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body ?? {};
    if (!email || !password) {
      return res.status(400).json({ message: 'Email en wachtwoord zijn verplicht.' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ message: 'Onjuiste inloggegevens.' });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ message: 'Onjuiste inloggegevens.' });

    const token = jwt.sign(
      { sub: user.id, role: user.role },
      process.env.JWT_SECRET || 'dev-secret',
      { expiresIn: '7d' }
    );

    return res.json({ token, user: { id: user.id, email: user.email, role: user.role, name: user.name } });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ message: 'Interne fout bij inloggen.' });
  }
});

router.post('/register', async (req, res) => {
  try {
    const { token, name, password } = req.body || {};
    if (!token || !password) return res.status(400).json({ message: 'token en password verplicht' });

    const tokenHash = crypto.createHash('sha256').update(String(token)).digest('hex');
    const inv = await prisma.userInvite.findUnique({ where: { tokenHash } });
    if (!inv || inv.usedAt || inv.expiresAt < new Date())
      return res.status(410).json({ message: 'Invite ongeldig of verlopen' });

    const existing = await prisma.user.findUnique({ where: { email: inv.email } });
    if (existing) return res.status(409).json({ message: 'Er bestaat al een account op dit e-mailadres' });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email: inv.email,
        name: name || inv.email.split('@')[0],
        role: inv.role,
        passwordHash,
      },
    });

    await prisma.userInvite.update({
      where: { tokenHash },
      data: { usedAt: new Date() },
    });

    const jwtToken = jwt.sign({ sub: user.id, role: user.role }, process.env.JWT_SECRET || 'dev-secret', {
      expiresIn: '7d',
    });

    return res.json({
      token: jwtToken,
      user: { id: user.id, email: user.email, role: user.role, name: user.name },
    });
  } catch (err) {
    console.error('register error:', err);
    return res.status(500).json({ message: 'Interne fout bij registreren' });
  }
});
export default router;
