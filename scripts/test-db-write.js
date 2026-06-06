const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("Saving a test trade with followedRules: true...");
  const result = await prisma.trade.create({
    data: {
      pair: "XAUUSD",
      tradeType: "MSNR",
      tradeDirection: "Long",
      date: "2026-06-06",
      time: "08:00",
      entryPrice: "2000",
      stopLoss: "1990",
      takeProfit: "2020",
      exitPrice: "2020",
      rrRatio: 2.0,
      lotSize: "1",
      tradeDuration: "1h",
      outcome: "Win",
      profitLoss: "100",
      profitLossPercent: "1%",
      beforeTrade: "before",
      duringTrade: "during",
      afterTrade: "after",
      followedRules: true,
      screenshots: "[]",
      tags: "[]",
    }
  });
  console.log("Success! Trade created in database:", result);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
