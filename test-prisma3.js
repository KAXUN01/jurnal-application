const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const prisma = new PrismaClient();
const out = [
  "Keys on PrismaClient: " + Object.keys(prisma).join(", "),
  "Is goal defined? " + !!prisma.goal,
  "Is habit defined? " + !!prisma.habit,
  "Is trade defined? " + !!prisma.trade
].join("\n");
fs.writeFileSync('test-out.txt', out);
console.log(out);
