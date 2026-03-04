const base_trade = {
  pair: "EU",
  tradeType: "15min PT",
  time: "14:30",
  bias1H: "bullish",
  rangeType: "narrow",
  poiType: "support",
  entryPrice: "1.0850",
  stopLoss: "1.0840",
  takeProfit: "1.0870",
  rrRatio: 2.0,
  lotSize: "1.0",
  entryType: "limit",
  poiTapped: true,
  chochConfirmed: false,
  outcome: "Win",
  profitLoss: "100",
  emotion: "confident",
  followedRules: true,
  mistakes: "None",
  screenshots: []
};

// Get dates for testing
const today = new Date();
today.setHours(0, 0, 0, 0);

// Today
const dateToday = today.toISOString().split("T")[0];

// This week (Monday of this week)
const weekStart = new Date(today);
const day = today.getDay();
const diff = today.getDate() - day + (day === 0 ? -6 : 1);
weekStart.setDate(diff);
const dateThisWeek = weekStart.toISOString().split("T")[0];

// This month (1st of this month)
const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
const dateThisMonth = monthStart.toISOString().split("T")[0];

// Last month
const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 15);
const dateLastMonth = lastMonth.toISOString().split("T")[0];

(async () => {
  try {
    console.log("Creating test trades with different dates...\n");
    
    // Create trade for today
    console.log(`1. Creating trade for TODAY (${dateToday})...`);
    let response = await fetch("http://localhost:3001/api/trades", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...base_trade, date: dateToday }),
    });
    const tradesToday = await response.json();
    console.log(`   ✓ Created trade: ${tradesToday.id}\n`);

    // Create trade for this week
    if (dateThisWeek !== dateToday) {
      console.log(`2. Creating trade for THIS WEEK (${dateThisWeek})...`);
      response = await fetch("http://localhost:3001/api/trades", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...base_trade, date: dateThisWeek }),
      });
      const tradeWeek = await response.json();
      console.log(`   ✓ Created trade: ${tradeWeek.id}\n`);
    }

    // Create trade for this month
    if (dateThisMonth !== dateToday) {
      console.log(`3. Creating trade for THIS MONTH (${dateThisMonth})...`);
      response = await fetch("http://localhost:3001/api/trades", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...base_trade, date: dateThisMonth, outcome: "Loss", profitLoss: "-50" }),
      });
      const tradeMonth = await response.json();
      console.log(`   ✓ Created trade: ${tradeMonth.id}\n`);
    }

    // Create trade for last month
    console.log(`4. Creating trade for LAST MONTH (${dateLastMonth})...`);
    response = await fetch("http://localhost:3001/api/trades", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...base_trade, date: dateLastMonth, outcome: "BE", profitLoss: "0" }),
    });
    const tradeLastMonth = await response.json();
    console.log(`   ✓ Created trade: ${tradeLastMonth.id}\n`);

    // Fetch all trades to verify
    console.log("5. Fetching all trades to verify date filtering...");
    response = await fetch("http://localhost:3001/api/trades");
    const allTrades = await response.json();
    console.log(`   ✓ Total trades in DB: ${allTrades.length}\n`);
    
    // Count trades by date range
    const countToday = allTrades.filter(t => t.date === dateToday).length;
    const countThisWeek = allTrades.filter(t => {
      const tDate = new Date(t.date);
      const wStart = new Date(weekStart);
      const wEnd = new Date(weekStart);
      wEnd.setDate(wStart.getDate() + 6);
      return tDate >= wStart && tDate <= wEnd;
    }).length;
    const countThisMonth = allTrades.filter(t => {
      const tDate = new Date(t.date);
      const mStart = new Date(today.getFullYear(), today.getMonth(), 1);
      const mEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      return tDate >= mStart && tDate <= mEnd;
    }).length;
    const countLastMonth = allTrades.filter(t => {
      const tDate = new Date(t.date);
      const m = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const mEnd = new Date(today.getFullYear(), today.getMonth(), 0);
      return tDate >= m && tDate <= mEnd;
    }).length;

    console.log("Date filtering verification:");
    console.log(`  Today: ${countToday} trade(s)`);
    console.log(`  This Week: ${countThisWeek} trade(s)`);
    console.log(`  This Month: ${countThisMonth} trade(s)`);
    console.log(`  Last Month: ${countLastMonth} trade(s)\n`);

    console.log("✓ Test completed! Check the /trades page to use the date filters.");
  } catch (e) {
    console.error("Test failed:", e.message);
  }
})();
