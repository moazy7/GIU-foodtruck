const db = require('../../connectors/db/knexfile');
const { getUser } = require('../utils/session');

// Truck controller — list trucks and fetch a truck by id
// Uses `FoodTruck.Trucks` (schema-qualified access)
// GET all trucks
async function getAllTrucks(req, res) {
  try {
   const trucks = await db
  .withSchema('FoodTruck').table('Trucks')
  .where({ truckStatus: 'available', orderStatus: 'available' })
  .orderBy('truckId', 'asc');


    return res.status(200).json(trucks);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}

// GET truck by ID
async function getTruckById(req, res) {
  try {
    const { truckId } = req.params;

    const id = parseInt(truckId, 10);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: 'truckId must be a number' });
    }

    const truck = await db
      .withSchema('FoodTruck').table('Trucks')
      .where({ truckId: id })
      .first();

    if (!truck) {
      return res.status(404).json({ error: 'Truck not found' });
    }

    return res.status(200).json(truck);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}

// GET /api/v1/trucks/myTruck
// Use getUser to find the current truck owner's truckId
async function getMyTruck(req, res) {
  try {
    const user = await getUser(req);
    if (!user || !user.truckId) {
      return res.status(401).json({ error: 'unauthorized' });
    }

    const truck = await db
      .withSchema('FoodTruck')
      .table('Trucks')
      .where({ truckId: user.truckId })
      .first();

    if (!truck) {
      return res.status(404).json({ error: 'truck not found' });
    }

    return res.status(200).json(truck);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}


module.exports = {
  getAllTrucks,
  getTruckById,
  getMyTruck,
};
