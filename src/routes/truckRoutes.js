const express = require('express');
const router = express.Router();

const {
  getAllTrucks,
  getTruckById,
} = require('../controllers/truckController');

router.get('/', getAllTrucks);
router.get('/:truckId', getTruckById);
router.get('/', getAllTrucks);
router.get('/:truckId', getTruckById);

module.exports = router;
