const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const email = 'kasunmadhushanw@gmail.com';
  const password = 'kasun';
  const name = 'Kasun Madhushan';

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      password: hashedPassword,
      name,
      role: 'admin',
    },
    create: {
      email,
      name,
      password: hashedPassword,
      role: 'admin',
    },
  });

  console.log('Account successfully updated/created for:', user.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
