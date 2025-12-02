// routes/orderRoutes.js
const express = require('express');
const router = express.Router();

const {
  createOrder,
  getUserOrders,
  getOrderById,
  getTruckOrders,
  updateOrderStatus,
} = require('../controllers/orderController');

// ------------------------
// ORIGINAL ENDPOINTS (KEEPING THEM)
// Base path: /api/v1/orders
// ------------------------

// POST /api/v1/orders/create
router.post('/create', createOrder);

// GET /api/v1/orders/user/:userId
router.get('/user/:userId', getUserOrders);

// GET /api/v1/orders/truck/:truckId
router.get('/truck/:truckId', getTruckOrders);

// GET /api/v1/orders/:orderId
router.get('/:orderId', getOrderById);

// PUT /api/v1/orders/:orderId/status
router.put('/:orderId/status', updateOrderStatus);

// ------------------------
// MILESTONE 3 ENDPOINTS
// Base path: /api/v1/orders
// (Note: PDF uses `/order/...` but your server mounts `/api/v1/orders`)
// ------------------------

// Create order from cart
// POST /api/v1/orders/new
router.post('/new', createOrder);

// Get all orders for a user
// GET /api/v1/orders/myOrders?userId=1
router.get('/myOrders', (req, res) => {
  const { userId } = req.query;
  if (!userId) {
    return res.status(400).json({ error: 'userId is required (query parameter)' });
  }
  req.params.userId = userId;
  return getUserOrders(req, res);
});

// Customer order details
// GET /api/v1/orders/details/:orderId
router.get('/details/:orderId', getOrderById);

// Truck owner order details (reuses same controller, no auth)
// GET /api/v1/orders/truckOwner/:orderId
router.get('/truckOwner/:orderId', getOrderById);

// All orders for a truck (truck owner)
// GET /api/v1/orders/truckOrders?truckId=1
router.get('/truckOrders', (req, res) => {
  const { truckId } = req.query;
  if (!truckId) {
    return res.status(400).json({ error: 'truckId is required (query parameter)' });
  }
  req.params.truckId = truckId;
  return getTruckOrders(req, res);
});

// Update order status
// PUT /api/v1/orders/updateStatus/:orderId
router.put('/updateStatus/:orderId', updateOrderStatus);

module.exports = router;
