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

// POST /api/v1/menuItem/new
router.post('/new', createMenuItem);

// GET /api/v1/menuItem
router.get('/view', getMenuItems);

// GET /api/v1/menuItem/:itemId
router.get('/view/:itemId', getMenuItemById);

// PUT /api/v1/menuItem/edit/:itemId (alias)
router.put('/edit/:itemId', updateMenuItem);

// DELETE /api/v1/menuItem/delete/:itemId
router.delete('/delete/:itemId', deleteMenuItem);

// GET /api/v1/menuItem/truck/1
router.get('/truck/:truckId', getTruckMenu);

// GET /api/v1/menuItem/truck/1/category/Main
router.get('/truck/:truckId/category/:category', getTruckMenuByCategory);

module.exports = router;
