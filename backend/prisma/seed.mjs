import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const password = 'Admin123!'; // kies zelf
  const hash = await bcrypt.hash(password, 10);

  await prisma.user.upsert({
    where: { email: 'admin@vansoest.nl' },
    update: {},
    create: {
      email: 'admin@vansoest.nl',
      name: 'Admin',
      role: 'beheerder',
      passwordHash: hash,
    },
  });

  console.log('Seed klaar: admin@vansoest.nl /', password);
}

main().finally(() => prisma.$disconnect());

