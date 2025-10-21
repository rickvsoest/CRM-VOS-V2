import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = Router();

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body ?? {};
    if (!email || !password) {
      return res.status(400).json({ message: 'Email en wachtwoord zijn verplicht.' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: 'Onjuiste inloggegevens.' });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return res.status(401).json({ message: 'Onjuiste inloggegevens.' });
    }

    const token = jwt.sign(
      { sub: user.id, role: user.role },
      process.env.JWT_SECRET || 'dev-secret',
      { expiresIn: '7d' }
    );

    return res.json({
      token,
      user: { id: user.id, email: user.email, role: user.role, name: user.name },
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ message: 'Interne fout bij inloggen.' });
  }
});

export default router;
