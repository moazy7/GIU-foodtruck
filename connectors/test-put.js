// Test script to PUT update a menu item
(async () => {
  try {
    const res = await fetch('http://localhost:3000/api/v1/menuItem/edit/1', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Updated Name from Test' }),
    });
    console.log('status', res.status);
    console.log(await res.text());
  } catch (err) {
    console.error('Request error:', err);
  }
})();
