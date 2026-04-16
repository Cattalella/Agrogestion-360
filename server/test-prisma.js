const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    await prisma.$connect();
    console.log('Successfully connected to the database with Prisma');
    const res = await prisma.rol.findMany({ take: 1 });
    console.log('Result:', res);
  } catch (e) {
    console.error('Connection error:', e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
