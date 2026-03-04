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
    const response = await fetch("http://localhost:3001/api/trades", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(test_trade),
    });

    const data = await response.json();
    console.log("Status:", response.status);
    console.log("Response:", JSON.stringify(data, null, 2));
  } catch (e) {
    console.error("Error:", e.message);
  }
})();
