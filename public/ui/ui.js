// Lightweight UI interactions for static pages
(function(){
  // Helper to POST JSON
  async function postJson(url, data){
    const res = await fetch(url, {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify(data),
      credentials: 'include'
    });
    return res;
  }

  // Login
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', async function(e){
      e.preventDefault();
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      try{
        const r = await postJson('/api/v1/user/login',{email,password});
        if(!r.ok){
          const t = await r.text(); alert(t||'Login failed'); return;
        }
        // redirect to customer dashboard
        window.location.href = '/ui/customer.html';
      }catch(err){ alert(err.message||'Network error'); }
    });
  }

  // Register
  const regForm = document.getElementById('registerForm');
  if (regForm) {
    regForm.addEventListener('submit', async function(e){
      e.preventDefault();
      const name = document.getElementById('name').value;
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      const birthDate = document.getElementById('birthDate') ? document.getElementById('birthDate').value : null;
      const payload = { userId: Date.now().toString(), name, email, password, birthDate };
      try{
        const r = await postJson('/api/v1/user', payload);
        if(!r.ok){ const t = await r.text(); alert(t||'Registration failed'); return; }
        alert('Registered successfully'); window.location.href = '/ui/login.html';
      }catch(err){ alert(err.message||'Network error'); }
    });
  }

  // Load trucks into trucks.html
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
        div.innerHTML = `<div class="text-center">🍽️</div><h5 class="mt-2 text-center">${t.truckName||'Unnamed'}</h5><div class="text-center mt-3"><a class="btn btn-orange" href="/ui/menu.html?truck=${t.truckId}">View Menu</a></div>`;
        container.appendChild(div);
      });
    }catch(err){ container.innerHTML='<div class="card p-4">Network error</div>'; }
  }

  // Load menu by truck id from query
  async function loadMenu(){
    const menuList = document.getElementById('menuList');
    if(!menuList) return;
    const params = new URLSearchParams(location.search);
    const truckId = params.get('truck');
    if(!truckId){ menuList.innerHTML='<div class="card p-4">No truck selected</div>'; return; }
    try{
      const res = await fetch(`/api/v1/menuItem/truck/${truckId}`);
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

  // Attach add to cart via event delegation
  document.addEventListener('click', async function(e){
    if(e.target && e.target.classList.contains('add-cart')){
      const itemId = e.target.dataset.id;
      try{
        const res = await postJson('/api/v1/cart/new',{ itemId, quantity:1 });
        if(!res.ok){ const t=await res.text(); alert(t||'Failed to add'); return; }
        alert('Added to cart');
      }catch(err){ alert('Network error'); }
    }
  });

  // Initialize page-specific loaders
  document.addEventListener('DOMContentLoaded', function(){
    loadTrucks();
    loadMenu();
  });

})();
