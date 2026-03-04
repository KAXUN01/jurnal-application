const { PrismaClient } = require('@prisma/client');
(async () => {
  try {
    const prisma = new PrismaClient({ log: ['query','error'] });
    await prisma.$connect();
    console.log('connected');
    await prisma.$disconnect();
  } catch (e) {
    console.error('error', e);
    process.exit(1);
  }
})();
