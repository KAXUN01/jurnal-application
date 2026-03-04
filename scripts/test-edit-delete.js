const test_trade = {
  pair: "EU",
  tradeType: "15min PT",
  date: "2026-03-04",
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

(async () => {
  try {
    console.log("1. Creating a test trade...");
    let response = await fetch("http://localhost:3001/api/trades", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(test_trade),
    });
    let trade = await response.json();
    const tradeId = trade.id;
    console.log(`✓ Trade created with ID: ${tradeId}\n`);

    console.log("2. Fetching the trade by ID...");
    response = await fetch(`http://localhost:3001/api/trades/${tradeId}`);
    trade = await response.json();
    console.log(`✓ Trade fetched: ${trade.pair} - ${trade.outcome}\n`);

    console.log("3. Updating the trade...");
    const updatedTrade = { ...trade, outcome: "Loss", profitLoss: "-50" };
    response = await fetch(`http://localhost:3001/api/trades/${tradeId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedTrade),
    });
    trade = await response.json();
    console.log(`✓ Trade updated: outcome=${trade.outcome}, profitLoss=${trade.profitLoss}\n`);

    console.log("4. Deleting the trade...");
    response = await fetch(`http://localhost:3001/api/trades/${tradeId}`, {
      method: "DELETE",
    });
    console.log(`✓ Trade deleted (status: ${response.status})\n`);

    console.log("5. Verifying trade was deleted...");
    response = await fetch(`http://localhost:3001/api/trades/${tradeId}`);
    if (response.status === 404) {
      console.log("✓ Trade successfully deleted (404 not found)\n");
    } else {
      console.log("✗ Trade still exists!\n");
    }

    console.log("All tests passed! ✓");
  } catch (e) {
    console.error("Test failed:", e.message);
  }
})();
