const express = require('express');
const router = express.Router();

const {
  getAllTrucks,
  getTruckById,
} = require('../controllers/truckController');

// GET /api/v1/trucks/view
router.get('/view', getAllTrucks);

// GET /api/v1/trucks/view/1
router.get('/view/:truckId', getTruckById);

module.exports = router;
