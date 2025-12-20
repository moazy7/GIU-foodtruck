// Lightweight API client for GIU-foodtruck
const baseUrl = '';
async function apiFetch(path, opts={}){
  const res = await fetch(baseUrl + path, {
    credentials: 'include',
    headers: {'Content-Type':'application/json'},
    ...opts
  });
  const text = await res.text();
  // try parse json
  try{ return {ok:res.ok, status:res.status, body: text ? JSON.parse(text) : null}; }catch(e){ return {ok:res.ok, status:res.status, body: text}; }
}

// Public
export async function register(payload){ return apiFetch('/api/v1/user', {method:'POST', body: JSON.stringify(payload)}); }
export async function login(credentials){ return apiFetch('/api/v1/user/login', {method:'POST', body: JSON.stringify(credentials)}); }

// Customer
export async function getTrucks(){ return apiFetch('/api/v1/trucks/view'); }
export async function getMenuByTruck(truckId){ return apiFetch(`/api/v1/menuItem/truck/${truckId}`); }
export async function getMenuByTruckCategory(truckId, category){ return apiFetch(`/api/v1/menuItem/truck/${truckId}/category/${encodeURIComponent(category)}`); }
export async function addToCart(itemId, quantity=1){ return apiFetch('/api/v1/cart/new', {method:'POST', body: JSON.stringify({itemId, quantity})}); }
export async function viewCart(){ return apiFetch('/api/v1/cart/view'); }
export async function updateCart(cartId, quantity){ return apiFetch('/api/v1/cart/update', {method:'PUT', body: JSON.stringify({cartId, quantity})}); }
export async function deleteCart(cartId){ return apiFetch(`/api/v1/cart/delete/${cartId}`, {method:'DELETE'}); }
export async function placeOrder(){ return apiFetch('/api/v1/cart/place', {method:'POST'}); }
export async function myOrders(){ return apiFetch('/api/v1/order/myOrders'); }
export async function orderDetails(orderId){ return apiFetch(`/api/v1/order/details/${orderId}`); }

// Owner
export async function myTruck(){ return apiFetch('/api/v1/trucks/myTruck'); }
export async function createMenuItem(payload){ return apiFetch('/api/v1/menuItem/new', {method:'POST', body: JSON.stringify(payload)}); }
export async function ownerMenu(){ return apiFetch('/api/v1/menuItem/view'); }
export async function editMenuItem(itemId, payload){ return apiFetch(`/api/v1/menuItem/edit/${itemId}`, {method:'PUT', body: JSON.stringify(payload)}); }
export async function deleteMenuItem(itemId){ return apiFetch(`/api/v1/menuItem/delete/${itemId}`, {method:'DELETE'}); }
export async function truckOrders(){ return apiFetch('/api/v1/order/truckOrders'); }
export async function truckOrderDetails(orderId){ return apiFetch(`/api/v1/order/truckOwner/${orderId}`); }
export async function updateOrderStatus(orderId, payload){ return apiFetch(`/api/v1/order/updateStatus/${orderId}`, {method:'PUT', body: JSON.stringify(payload)}); }
