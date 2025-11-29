const express = require('express');
const router = express.Router();

const {
  getAllTrucks,
  getTruckById,
} = require('../controllers/truckController');

const {
  updateTruckOrderStatus,
} = require('../controllers/orderController');

router.get('/', getAllTrucks);
router.get('/:truckId', getTruckById);
router.put('/:truckId/orders/:orderId/status', updateTruckOrderStatus);

module.exports = router;
