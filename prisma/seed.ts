import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "../src/generated/prisma/client.js"
import { hashPassword } from "../src/shared/password.js"

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

async function main() {
  await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: { role: "SUPERADMIN" },
    create: {
      email: "admin@example.com",
      password: hashPassword("123456"),
      role: "SUPERADMIN"
    }
  })
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (error) => {
    console.error(error)
    await prisma.$disconnect()
    process.exit(1)
  })
