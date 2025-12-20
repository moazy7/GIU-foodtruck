const axios = require('axios').default;

axios.defaults.baseURL = 'http://localhost:3001';
axios.defaults.withCredentials = true;

async function run(){
  try{
    // register a temp user
    const email = `test_user_${Date.now()}@example.com`;
    console.log('Registering user', email);
    r = await axios.post('/api/v1/user', { name: 'Test User', email, password: 'pass123' });
    console.log('register', r.status);

    // login (this will set cookie)
    console.log('Logging in');
    r = await axios.post('/api/v1/user/login', { email, password: 'pass123' });
    console.log('login', r.status, r.data);

    // view trucks
    r = await axios.get('/api/v1/trucks/view'); console.log('trucks', r.status, Array.isArray(r.data) ? r.data.length + ' items' : r.data);

    if(Array.isArray(r.data) && r.data.length>0){
      const truckId = r.data[0].truckId;
      console.log('Fetch menu for truck', truckId);
      const m = await axios.get(`/api/v1/menuItem/truck/${truckId}`); console.log('menu items', m.status, (m.data||[]).length);
      if((m.data||[]).length>0){
        const itemId = m.data[0].itemId;
        console.log('Add to cart item', itemId);
        const add = await axios.post('/api/v1/cart/new', { itemId, quantity: 1 }); console.log('add to cart', add.status, add.data);
        const cart = await axios.get('/api/v1/cart/view'); console.log('cart view', cart.status, cart.data);
        console.log('Place order');
        const place = await axios.post('/api/v1/cart/place'); console.log('place order', place.status, place.data);
      }
    }

    console.log('All tests finished');
    process.exit(0);
  }catch(e){
    if(e.response){ console.error('ERROR', e.response.status, e.response.data); }
    else console.error('ERROR', e.message);
    process.exit(2);
  }
}

run();
