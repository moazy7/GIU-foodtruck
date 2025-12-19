(async ()=>{
  try{
    const res = await fetch('http://localhost:3001/api/v1/user',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ userId: Date.now().toString(), name:'Test', email:`test${Date.now()}@example.com`, password:'pass', birthDate:'1990-01-01'}),
    });
    console.log('status', res.status);
    const text = await res.text();
    console.log('body', text);
  }catch(e){ console.error('request error', e); }
})();
