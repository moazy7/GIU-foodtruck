// src/routes/private/api.js
const express = require('express');
const router = express.Router();

// Controllers
const cart  = require('../../controllers/cartController');
const menu  = require('../../controllers/menuItemController');
const order = require('../../controllers/orderController');
const truck = require('../../controllers/truckController');

/**
 * MENU ITEM MANAGEMENT (Truck Owner)
 * These use your existing menuItemController functions.
 */

// Create a new menu item
// POST /api/v1/menuItem/new
router.post('/menuItem/new', menu.createMenuItem);

// View all menu items for a truck (requires ?truckId= in query)
// GET /api/v1/menuItem/view?truckId=1
router.get('/menuItem/view', menu.getMenuItems);

// View a single menu item by id
// GET /api/v1/menuItem/view/:itemId
router.get('/menuItem/view/:itemId', menu.getMenuItemById);

// Edit a menu item
// PUT /api/v1/menuItem/edit/:itemId
router.put('/menuItem/edit/:itemId', menu.updateMenuItem);

// Delete a menu item
// DELETE /api/v1/menuItem/delete/:itemId
router.delete('/menuItem/delete/:itemId', menu.deleteMenuItem);


// TRUCK MANAGEMENT

// Customer - view available trucks
router.get('/trucks/view', truck.getAllTrucks);

// Truck owner - view their own truck (uses getUser)
router.get('/trucks/myTruck', truck.getMyTruck);

// View single truck by id (generic)
router.get('/trucks/:truckId', truck.getTruckById);


/**
 * BROWSE MENU (Customer)
 */
// GET /api/v1/menuItem/truck/:truckId
router.get('/menuItem/truck/:truckId', menu.getTruckMenu);

// GET /api/v1/menuItem/truck/:truckId/category/:category
router.get('/menuItem/truck/:truckId/category/:category', menu.getTruckMenuByCategory);


/**
 * CART MANAGEMENT
 * These use your existing cartController functions.
 */

// Add to cart
// POST /api/v1/cart/new
router.post('/cart/new', cart.addToCart);

// View cart items for a user (path param, matches getCartItems implementation)
// GET /api/v1/cart/view/:userId
router.get('/cart/view/:userId', cart.getCartItems);

// Delete cart item
// DELETE /api/v1/cart/delete/:cartItemId
router.delete('/cart/delete/:cartItemId', cart.removeFromCart);

// (We will add /cart/edit/:cartId later when we implement updateCartItem in the controller)


/**
 * ORDER MANAGEMENT
 * These use your existing orderController functions.
 */

// Create new order from cart
// POST /api/v1/order/new
router.post('/order/new', order.createOrder);

// Get all orders for a user
// GET /api/v1/order/myOrders/:userId
router.get('/order/myOrders/:userId', order.getUserOrders);

// Get details of a single order
// GET /api/v1/order/details/:orderId
router.get('/order/details/:orderId', order.getOrderById);

// Get all orders for a truck
// GET /api/v1/order/truckOrders/:truckId
router.get('/order/truckOrders/:truckId', order.getTruckOrders);

// Update order status (generic)
// PUT /api/v1/order/updateStatus/:orderId
router.put('/order/updateStatus/:orderId', order.updateOrderStatus);

// Truck-specific order status update
// PUT /api/v1/trucks/:truckId/orders/:orderId/status
router.put('/trucks/:truckId/orders/:orderId/status', order.updateTruckOrderStatus);

module.exports = router;
