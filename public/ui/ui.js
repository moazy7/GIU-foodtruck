// Lightweight UI interactions for static pages
(function(){
  // Helper to POST/PUT JSON
  async function sendJson(method, url, data){
    const res = await fetch(url, {
      method: method,
      headers: {'Content-Type':'application/json'},
      body: data ? JSON.stringify(data) : undefined,
      credentials: 'include'
    });
    return res;
  }

  // Convenience POST
  const postJson = (url, data) => sendJson('POST', url, data);
  const putJson = (url, data) => sendJson('PUT', url, data);

  // ------------------ Authentication ------------------
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', async function(e){
      e.preventDefault();
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      try{
        const r = await postJson('/api/v1/user/login',{email,password});
        if(!r.ok){ const t = await r.text(); alert(t||'Login failed'); return; }
        // redirect to trucks page after login
        window.location.href = 'trucks.html';
      }catch(err){ alert(err.message||'Network error'); }
    });
  }

  const regForm = document.getElementById('registerForm');
  if (regForm) {
    regForm.addEventListener('submit', async function(e){
      e.preventDefault();
      const name = document.getElementById('name').value;
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      const birthDate = document.getElementById('birthDate') ? document.getElementById('birthDate').value : null;
      const payload = { name, email, password, birthDate };
      try{
        const r = await postJson('/api/v1/user', payload);
        if(!r.ok){ const t = await r.text(); alert(t||'Registration failed'); return; }
        alert('Registered successfully'); window.location.href = 'login.html';
      }catch(err){ alert(err.message||'Network error'); }
    });
  }

  // ------------------ Trucks & Menu ------------------
  async function loadTrucks(){
    const container = document.getElementById('trucksList');
    if(!container) return;
    try{
      const res = await fetch('/api/v1/trucks/view');
      if(!res.ok){ container.innerHTML='<div class="card p-4">Could not load trucks</div>'; return; }
      const data = await res.json();
      if(!Array.isArray(data) || data.length===0){ container.innerHTML='<div class="card p-4">No trucks available</div>'; return; }
      container.innerHTML='';
      data.forEach(t=>{
        const div = document.createElement('div');
        div.className='card p-4 shadow-sm';
        div.style.width='240px';
        div.innerHTML = `<div class="text-center">🍽️</div><h5 class="mt-2 text-center">${t.truckName||'Unnamed'}</h5><div class="text-center mt-3"><a class="btn btn-orange" href="menu.html?truck=${t.truckId}">View Menu</a></div>`;
        container.appendChild(div);
      });
    }catch(err){ container.innerHTML='<div class="card p-4">Network error</div>'; }
  }

  // Load menu by truck id from query (and support filter)
  async function loadMenu(){
    const menuList = document.getElementById('menuList');
    if(!menuList) return;
    const params = new URLSearchParams(location.search);
    const truckId = params.get('truck');
    if(!truckId){ menuList.innerHTML='<div class="card p-4">No truck selected</div>'; return; }

    const filterInput = document.getElementById('filterInput');
    const filterBtn = document.getElementById('filterBtn');
    const clearBtn = document.getElementById('clearBtn');

    async function fetchAndRender(category){
      try{
        const url = category ? `/api/v1/menuItem/truck/${truckId}/category/${encodeURIComponent(category)}` : `/api/v1/menuItem/truck/${truckId}`;
        const res = await fetch(url);
        if(!res.ok){ menuList.innerHTML='<div class="card p-4">Could not load menu</div>'; return; }
        const items = await res.json();
        if(!items.length){ menuList.innerHTML='<div class="card p-4">No items found</div>'; return; }
        menuList.innerHTML='';
        items.forEach(it=>{
          const d = document.createElement('div'); d.className='card p-3 shadow-sm'; d.style.width='260px';
          d.innerHTML = `<h5>${it.name}</h5><p class="small text-muted">${it.description||''}</p><div class="d-flex justify-content-between align-items-center"><strong>$${it.price}</strong><button class="btn btn-orange btn-sm add-cart" data-id="${it.itemId}">Add to cart</button></div>`;
          menuList.appendChild(d);
        });
      }catch(err){ menuList.innerHTML='<div class="card p-4">Network error</div>'; }
    }

    if(filterBtn){ filterBtn.addEventListener('click', ()=> fetchAndRender(filterInput && filterInput.value ? filterInput.value.trim() : null)); }
    if(clearBtn){ clearBtn.addEventListener('click', ()=> { if(filterInput) filterInput.value=''; fetchAndRender(null); }); }

    fetchAndRender(null);
  }

  // ------------------ Cart ------------------
  async function loadCart(){
    const cartBody = document.getElementById('cartBody');
    if(!cartBody) return;
    try{
      const res = await fetch('/api/v1/cart/view', { credentials: 'include' });
      if(!res.ok){ cartBody.innerHTML='<p class="lead">Could not load cart</p>'; return; }
      const data = await res.json();
      const items = data.items || [];
      if(items.length === 0){ cartBody.innerHTML=`<p class="lead">Your cart is empty</p><a class="btn btn-orange" href="/ui/trucks.html">Browse Trucks</a>`; return; }
      const container = document.createElement('div');
      container.className='d-flex flex-column gap-3';
      items.forEach(it => {
        const row = document.createElement('div'); row.className='d-flex justify-content-between align-items-center p-2 border';
        row.innerHTML = `<div><strong>${it.name}</strong><div class="small text-muted">${it.description||''}</div></div><div class="d-flex gap-2 align-items-center"><button class="btn btn-outline-secondary btn-sm qty-decr" data-id="${it.cartId}" data-qty="${it.quantity}">−</button><div class="px-2">${it.quantity}</div><button class="btn btn-outline-secondary btn-sm qty-incr" data-id="${it.cartId}" data-qty="${it.quantity}">+</button><div class="px-3"><strong>$${it.lineTotal.toFixed(2)}</strong></div><button class="btn btn-danger btn-sm remove-item" data-id="${it.cartId}">Remove</button></div>`;
        container.appendChild(row);
      });
      const footer = document.createElement('div'); footer.className='text-end mt-3'; footer.innerHTML = `<div class="h5">Total: $${(data.totalPrice||0).toFixed(2)}</div><div class="mt-2"><button id="placeOrderBtn" class="btn btn-orange">Place Order</button></div>`;
      cartBody.innerHTML=''; cartBody.appendChild(container); cartBody.appendChild(footer);
    }catch(err){ cartBody.innerHTML='<p class="lead">Network error</p>'; }
  }

  // ------------------ Orders (customer) ------------------
  async function loadOrders(){
    const container = document.getElementById('ordersList') || document.getElementById('ordersBody');
    if(!container) return;
    try{
      const res = await fetch('/api/v1/order/myOrders');
      if(!res.ok){ container.innerHTML='<div class="card p-4">Could not load orders</div>'; return; }
      const orders = await res.json();
      if(!orders.length){ container.innerHTML='<div class="card p-4">No orders yet</div>'; return; }
      container.innerHTML='';
      orders.forEach(o=>{
        const card = document.createElement('div'); card.className='card p-3 mb-2';
        card.innerHTML = `<div class="d-flex justify-content-between"><div><strong>Order #${o.orderId}</strong><div class="small text-muted">${o.truckName}</div></div><div><span class="badge bg-secondary">${o.orderStatus}</span></div></div><div class="mt-2">Total: $${(o.totalPrice||0).toFixed(2)}</div>`;
        container.appendChild(card);
      });
    }catch(err){ container.innerHTML='<div class="card p-4">Network error</div>'; }
  }

  // ------------------ Owner: menu & orders ------------------
  async function loadOwnerMenu(){
    const menuTable = document.getElementById('menuTable');
    if(!menuTable) return;
    try{
      const res = await fetch('/api/v1/menuItem/view');
      if(!res.ok){ menuTable.innerHTML='<div class="card p-4">Could not load menu</div>'; return; }
      const items = await res.json();
      if(!items.length){ menuTable.innerHTML='<div class="card p-4">No items yet</div>'; return; }
      const tbl = document.createElement('div'); tbl.className='d-flex flex-column gap-2';
      items.forEach(it=>{
        const row = document.createElement('div'); row.className='d-flex justify-content-between align-items-center p-2 border';
        row.innerHTML = `<div><strong>${it.name}</strong><div class="small text-muted">${it.category || ''} — ${it.description||''}</div></div><div class="d-flex gap-2"><div class="pe-2">$${it.price}</div><button class="btn btn-outline-secondary btn-sm edit-item" data-id="${it.itemId}">Edit</button><button class="btn btn-danger btn-sm delete-item" data-id="${it.itemId}">Delete</button></div>`;
        tbl.appendChild(row);
      });
      menuTable.innerHTML=''; menuTable.appendChild(tbl);
    }catch(err){ menuTable.innerHTML='<div class="card p-4">Network error</div>'; }
  }

  // ------------------ Owner Dashboard stats ------------------
  async function loadOwnerDashboard(){
    const container = document.querySelector('.container.py-4');
    if(!container) return;
    try{
      // fetch menu items and orders for counts
      const [menuRes, ordersRes] = await Promise.all([
        fetch('/api/v1/menuItem/view', { credentials: 'include' }),
        fetch('/api/v1/order/truckOrders', { credentials: 'include' })
      ]);
      if(!menuRes.ok || !ordersRes.ok) return;
      const menuItems = await menuRes.json();
      const orders = await ordersRes.json();

      const menuCount = Array.isArray(menuItems) ? menuItems.length : 0;
      const pendingCount = Array.isArray(orders) ? orders.filter(o => o.orderStatus === 'pending').length : 0;
      // completed today: compare createdAt date to today
      const today = new Date().toISOString().slice(0,10);
      const completedToday = Array.isArray(orders) ? orders.filter(o => o.orderStatus === 'completed' && o.createdAt && o.createdAt.slice(0,10) === today).length : 0;

      // find the three stat cards in the dashboard (they are the first .row .col-md-4 elements)
      const statCards = container.querySelectorAll('.row .col-md-4 .card');
      if(statCards && statCards.length >= 3){
        statCards[0].innerHTML = `${menuCount}<br><small>Menu Items</small>`;
        statCards[1].innerHTML = `${pendingCount}<br><small>Pending Orders</small>`;
        statCards[2].innerHTML = `${completedToday}<br><small>Completed Today</small>`;
      }
    }catch(err){ /* ignore silently */ }
  }

  async function loadOwnerOrders(){
    const container = document.getElementById('ownerOrdersList') || document.getElementById('ownerOrdersBody');
    if(!container) return;
    try{
      const res = await fetch('/api/v1/order/truckOrders');
      if(!res.ok){ container.innerHTML='<div class="card p-4">Could not load orders</div>'; return; }
      const orders = await res.json();
      if(!orders.length){ container.innerHTML='<div class="card p-4">No orders yet</div>'; return; }
      container.innerHTML='';
      orders.forEach(o=>{
        const card = document.createElement('div'); card.className='card p-3 mb-2';
        card.innerHTML = `<div class="d-flex justify-content-between"><div><strong>Order #${o.orderId}</strong><div class="small text-muted">${o.customerName}</div></div><div><span class="badge bg-secondary">${o.orderStatus}</span></div></div><div class="mt-2">Total: $${(o.totalPrice||0).toFixed(2)}</div><div class="mt-2 d-flex gap-2"><button class="btn btn-sm btn-outline-secondary update-status" data-id="${o.orderId}" data-status="preparing">Set Preparing</button><button class="btn btn-sm btn-outline-secondary update-status" data-id="${o.orderId}" data-status="ready">Set Ready</button></div>`;
        container.appendChild(card);
      });
    }catch(err){ container.innerHTML='<div class="card p-4">Network error</div>'; }
  }

  // ------------------ Event delegation ------------------
  document.addEventListener('click', async function(e){
    try{
      // Add to cart
      if(e.target && e.target.classList.contains('add-cart')){
        const itemId = e.target.dataset.id;
        const res = await postJson('/api/v1/cart/new',{ itemId, quantity:1 });
        if(!res.ok){ const t=await res.text(); alert(t||'Failed to add'); return; }
        alert('Added to cart');
        return;
      }

      // Increase quantity
      if(e.target && e.target.classList.contains('qty-incr')){
        const cartId = e.target.dataset.id; let qty = parseInt(e.target.dataset.qty||'1',10); qty = qty+1;
        const r = await putJson('/api/v1/cart/update',{ cartId, quantity: qty });
        if(!r.ok){ const t=await r.text(); alert(t||'Could not update'); return; }
        await loadCart(); return;
      }

      // Decrease quantity
      if(e.target && e.target.classList.contains('qty-decr')){
        const cartId = e.target.dataset.id; let qty = parseInt(e.target.dataset.qty||'1',10); qty = qty-1;
        const r = await putJson('/api/v1/cart/update',{ cartId, quantity: qty });
        if(!r.ok){ const t=await r.text(); alert(t||'Could not update'); return; }
        await loadCart(); return;
      }

      // Remove item
      if(e.target && e.target.classList.contains('remove-item')){
        const cartId = e.target.dataset.id;
        const r = await fetch(`/api/v1/cart/delete/${cartId}`, { method: 'DELETE', credentials: 'include' });
        if(!r.ok){ const t=await r.text(); alert(t||'Could not remove'); return; }
        await loadCart(); return;
      }

      // Place order
      if(e.target && e.target.id === 'placeOrderBtn'){
        const r = await postJson('/api/v1/cart/place', {});
        if(!r.ok){ const t=await r.text(); alert(t||'Could not place order'); return; }
        alert('Order placed'); window.location.href = 'orders.html'; return;
      }

      // Delete menu item (owner)
      if(e.target && e.target.classList.contains('delete-item')){
        const id = e.target.dataset.id;
        const r = await fetch(`/api/v1/menuItem/delete/${id}`, { method: 'DELETE', credentials: 'include' });
        if(!r.ok){ const t=await r.text(); alert(t||'Could not delete'); return; }
        await loadOwnerMenu(); return;
      }

      // Update order status (owner)
      if(e.target && e.target.classList.contains('update-status')){
        const id = e.target.dataset.id; const status = e.target.dataset.status;
        const r = await putJson(`/api/v1/order/updateStatus/${id}`, { orderStatus: status });
        if(!r.ok){ const t=await r.text(); alert(t||'Could not update order'); return; }
        await loadOwnerOrders(); return;
      }

      // Edit item — go to add item page with query param (simple flow)
      if(e.target && e.target.classList.contains('edit-item')){
        const id = e.target.dataset.id; window.location.href = `add_item.html?edit=${id}`; return;
      }

    }catch(err){ console.error(err); alert(err.message||'Network error'); }
  });

  // ------------------ Add item form (owner)
  // Handler will be attached on DOMContentLoaded so it can know whether we're editing

  // ------------------ Initialization ------------------
  document.addEventListener('DOMContentLoaded', function(){
    loadTrucks();
    loadMenu();
    loadCart();
    loadOrders();
    loadOwnerMenu();
    loadOwnerOrders();
    loadOwnerDashboard();

    // prefill edit form on add_item.html if ?edit=<id>
    const params = new URLSearchParams(location.search);
    const editId = params.get('edit');

    const addItemForm = document.getElementById('addItemForm');
    if(addItemForm){
      // If editing, prefill fields
      if(editId){
        (async ()=>{
          try{
            const r = await fetch(`/api/v1/menuItem/view/${editId}`);
            if(r.ok){
              const it = await r.json();
              document.getElementById('itemName').value = it.name||'';
              document.getElementById('itemCategory').value = it.category||'';
              document.getElementById('itemDescription').value = it.description||'';
              document.getElementById('itemPrice').value = it.price||'';
            }
          }catch(e){ /* ignore */ }
        })();
      }

      addItemForm.addEventListener('submit', async function(e){
        e.preventDefault();
        const name = document.getElementById('itemName').value;
        const category = document.getElementById('itemCategory').value || 'general';
        const description = document.getElementById('itemDescription').value || null;
        const price = parseFloat(document.getElementById('itemPrice').value) || 0;
        try{
          if(editId){
            const r = await putJson(`/api/v1/menuItem/edit/${editId}`, { name, price, description, category });
            if(!r.ok){ const t=await r.text(); alert(t||'Could not update item'); return; }
            alert('Item updated'); window.location.href = 'owner_menu.html';
          }else{
            const r = await postJson('/api/v1/menuItem/new', { name, price, description, category });
            if(!r.ok){ const t=await r.text(); alert(t||'Could not add item'); return; }
            alert('Item added'); window.location.href = 'owner_menu.html';
          }
        }catch(err){ alert(err.message||'Network error'); }
      });
    }
  });

})();
