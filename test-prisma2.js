const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
console.log("Keys on PrismaClient:", Object.keys(prisma));
console.log("Is goal defined?", !!prisma.goal);
console.log("Is habit defined?", !!prisma.habit);
console.log("Is trade defined?", !!prisma.trade);
