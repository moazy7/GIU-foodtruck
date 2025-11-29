const express = require('express');
const router = express.Router();

const {
  createOrder,
  getUserOrders,
  getOrderById,
  getTruckOrders,
  updateOrderStatus,
} = require('../controllers/orderController');

// POST /api/v1/orders/create
router.post('/create', createOrder);

// GET /api/v1/orders/user/1
router.get('/user/:userId', getUserOrders);

// GET /api/v1/orders/10
router.get('/:orderId', getOrderById);

// GET /api/v1/orders/truck/1
router.get('/truck/:truckId', getTruckOrders);

// PUT /api/v1/orders/1/status
router.put('/:orderId/status', updateOrderStatus);

module.exports = router;
