// scripts/create-user.mjs
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const email = process.env.SEED_EMAIL || "admin@voscrm.local";
  const name = process.env.SEED_NAME || "Admin";
  const role = process.env.SEED_ROLE || "BEHEERDER";
  const rawPassword = process.env.SEED_PASSWORD || "Admin!234";
  const passwordHash = await bcrypt.hash(rawPassword, 10);

  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: { email, name, role, passwordHash },
  });

  console.log("✅ User:", { id: user.id, email: user.email, role: user.role });
}

main().catch((e) => {
  console.error("❌ Fout:", e);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});

