const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function main() {
  // Fix old "Breakeven" records to "BE"
  const result = await p.trade.updateMany({
    where: { outcome: "Breakeven" },
    data: { outcome: "BE" }
  });
  console.log(`Updated ${result.count} "Breakeven" records to "BE"`);
  
  // Show all trades
  const trades = await p.trade.findMany({
    select: { id: true, outcome: true, profitLoss: true, date: true },
    orderBy: { date: 'desc' }
  });
  console.log("\nAll trades after fix:");
  console.log(JSON.stringify(trades, null, 2));
}

main().finally(() => p.$disconnect());
