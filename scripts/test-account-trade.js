(async () => {
  try {
    // Create account
    let res = await fetch('http://localhost:3001/api/accounts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Test Demo', type: 'demo', balance: 1000 }),
    });
    const account = await res.json();
    console.log('Created account:', account.id, account.name);

    // Create trade linked to account
    const trade = {
      accountId: account.id,
      pair: 'EU',
      tradeType: '15min PT',
      date: new Date().toISOString().split('T')[0],
      time: '12:00',
      bias1H: 'bullish',
      rangeType: 'narrow',
      poiType: 'support',
      entryPrice: '1.1000',
      stopLoss: '1.0990',
      takeProfit: '1.1020',
      rrRatio: 2,
      lotSize: '1.0',
      entryType: 'limit',
      poiTapped: true,
      chochConfirmed: false,
      outcome: 'Win',
      profitLoss: '50',
      emotion: 'confident',
      followedRules: true,
      mistakes: '',
      screenshots: [],
    };

    res = await fetch('http://localhost:3001/api/trades', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(trade),
    });
    const created = await res.json();
    console.log('Created trade:', created.id, 'accountId:', created.accountId);

    // Fetch trades and show mapping
    res = await fetch('http://localhost:3001/api/trades');
    const trades = await res.json();
    const t = trades.find((x) => x.id === created.id);
    console.log('Fetched trade accountId:', t.accountId);

  } catch (e) {
    console.error('Test failed:', e);
  }
})();
