const express = require('express');
const router = express.Router();

// CONTROLLERS
const cart = require('../../controllers/cartController');
const menu = require('../../controllers/menuItemController');
const order = require('../../controllers/orderController');
const truck = require('../../controllers/truckController');

// MENU ITEM MANAGEMENT (Truck Owner)
router.post('/menuItem/new', menu.createMenuItem);
router.get('/menuItem/view', menu.getMenuItems);
router.get('/menuItem/view/:itemId', menu.getMenuItemById);
router.put('/menuItem/edit/:itemId', menu.updateMenuItem);
router.delete('/menuItem/delete/:itemId', menu.deleteMenuItem);

// TRUCK MANAGEMENT
router.get('/trucks/view', truck.getAllTrucks);
router.get('/trucks/myTruck', truck.getMyTruck);
router.put('/trucks/updateOrderStatus', order.updateTruckOrderStatus);

// BROWSE MENU (Customer)
router.get('/menuItem/truck/:truckId', menu.getTruckMenu);
router.get('/menuItem/truck/:truckId/category/:category', menu.getTruckMenuByCategory);

// CART MANAGEMENT
router.post('/cart/new', cart.addToCart);
router.get('/cart/view', cart.getCartItems);
router.put('/cart/edit/:cartId', cart.updateCartItem);
router.delete('/cart/delete/:cartId', cart.removeFromCart);

// ORDER MANAGEMENT
router.post('/order/new', order.createOrder);
router.get('/order/myOrders', order.getUserOrders);
router.get('/order/details/:orderId', order.getOrderDetailsForCustomer);
router.get('/order/truckOwner/:orderId', order.getOrderDetailsForTruckOwner);
router.get('/order/truckOrders', order.getTruckOrdersForOwner);
router.put('/order/updateStatus/:orderId', order.updateOrderStatusForTruckOwner);

module.exports = router;
