// import { prisma } from '@/lib/prisma';

// const prisma = new PrismaClient();
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
async function main() {
  const hashedPassword = await bcrypt.hash("admin", 10);

  await prisma.user.upsert({
    where: { username: "admin" },
    update: {},
    create: {
      username: "admin",
      password: hashedPassword,
      role: "ADMIN",
    },
  });

  console.log("✅ Default admin created: admin/admin");
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
