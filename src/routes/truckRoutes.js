const express = require('express');
const router = express.Router();

const {
  getAllTrucks,
  getTruckById,
  getMyTruck,
} = require('../controllers/truckController');
const { updateOrderStatus } = require('../controllers/orderController'); // we’ll write this below

// existing / and /:truckId routes can stay if you still need them.

// Milestone 3:
router.get('/view', getAllTrucks);
router.get('/myTruck', getMyTruck);
router.put('/updateOrderStatus', updateOrderStatus);

module.exports = router;
