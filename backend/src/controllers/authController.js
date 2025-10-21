import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function login(req, res) {
  try {
    // 1) Basic input
    const { email, password } = req.body ?? {};
    if (!email || !password) {
      return res.status(400).json({ message: 'Email en wachtwoord zijn verplicht.' });
    }

    // 2) Config check
    if (!process.env.JWT_SECRET) {
      console.error('[auth] Missing JWT_SECRET');
      return res.status(500).json({ message: 'Server niet goed geconfigureerd.' });
    }

    // 3) User opzoeken
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Niet verklappen of email bestaat:
      return res.status(401).json({ message: 'Onjuist e-mailadres of wachtwoord.' });
    }

    // 4) Hash veld naam (verschillende schema’s ondersteunen)
    // Probeer een paar gangbare velden:
    const hash =
      user.passwordHash ??
      user.password_hash ??
      user.password ??
      null;

    if (!hash || typeof hash !== 'string' || hash.length < 20) {
      // Hash ontbreekt of lijkt geen bcrypt-hash
      console.error('[auth] No valid password hash on user record', { email, hasHash: !!hash });
      return res.status(401).json({ message: 'Onjuist e-mailadres of wachtwoord.' });
    }

    // 5) Wachtwoord check
    let ok = false;
    try {
      ok = await bcrypt.compare(password, hash);
    } catch (e) {
      console.error('[auth] bcrypt.compare failed', e);
      return res.status(500).json({ message: 'Interne serverfout.' });
    }
    if (!ok) {
      return res.status(401).json({ message: 'Onjuist e-mailadres of wachtwoord.' });
    }

    // 6) Token
    const token = jwt.sign(
      { sub: user.id, role: user.role, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      token,
      user: { id: user.id, email: user.email, role: user.role, name: user.name ?? null }
    });
  } catch (err) {
    console.error('[auth] login error', err);
    return res.status(500).json({ message: 'Interne serverfout.' });
  }
}
