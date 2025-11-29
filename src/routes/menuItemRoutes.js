const express = require('express');
const router = express.Router();

const { 
    createMenuItem,
    getMenuItems,
    getMenuItemById,
    updateMenuItem,
    deleteMenuItem,
    getTruckMenu,
    getTruckMenuByCategory,

} = require('../controllers/menuItemController');

// RESTful: POST /api/v1/menuItem
router.post('/', createMenuItem);

// RESTful: GET /api/v1/menuItem?truckId=1
router.get('/', getMenuItems);

// RESTful: GET /api/v1/menuItem/:itemId
router.get('/:itemId', getMenuItemById);

// RESTful: PUT /api/v1/menuItem/:itemId
router.put('/:itemId', updateMenuItem);

// RESTful: DELETE /api/v1/menuItem/:itemId
router.delete('/:itemId', deleteMenuItem);

// GET /api/v1/menuItem/truck/1
router.get('/truck/:truckId', getTruckMenu);

// GET /api/v1/menuItem/truck/1/category/Main
router.get('/truck/:truckId/category/:category', getTruckMenuByCategory);

module.exports = router;
