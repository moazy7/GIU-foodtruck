// Very small smoke tests to exercise critical endpoints
(async () => {
  try {
    const base = 'http://localhost:3000';
    console.log('Running smoke tests against', base);

    // 1) GET server root
    let r = await fetch(base + '/');
    console.log('GET / ->', r.status);

    // 2) GET menu items for truck 1
    r = await fetch(base + '/api/v1/menuItem?truckId=1');
    console.log('GET /api/v1/menuItem?truckId=1 ->', r.status);

    // 3) POST create a menu item (won't fail if missing fields but we won't actually create in smoke test)
    // 4) GET trucks
    r = await fetch(base + '/api/v1/trucks');
    console.log('GET /api/v1/trucks ->', r.status);

    console.log('Smoke tests complete');
    process.exit(0);
  } catch (err) {
    console.error('Smoke tests failed:', err.message);
    process.exit(1);
  }
})();
