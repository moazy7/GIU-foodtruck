// routes/menuItemRoutes.js
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

// ------------------------
// ORIGINAL RESTFUL ENDPOINTS (KEEPING THEM)
// Base path: /api/v1/menuItem
// ------------------------

// POST /api/v1/menuItem
router.post('/', createMenuItem);

// GET /api/v1/menuItem?truckId=1
router.get('/', getMenuItems);

// GET /api/v1/menuItem/truck/1
router.get('/truck/:truckId', getTruckMenu);

// GET /api/v1/menuItem/truck/1/category/Main
router.get('/truck/:truckId/category/:category', getTruckMenuByCategory);

// GET /api/v1/menuItem/10
router.get('/:itemId', getMenuItemById);

// PUT /api/v1/menuItem/10
router.put('/:itemId', updateMenuItem);

// DELETE /api/v1/menuItem/10
router.delete('/:itemId', deleteMenuItem);

// ------------------------
// MILESTONE 3 ENDPOINTS (ALIASES)
// Base path: /api/v1/menuItem
// ------------------------

// Truck owner creates a new menu item
// POST /api/v1/menuItem/new
router.post('/new', createMenuItem);

// Truck owner views all their menu items
// GET /api/v1/menuItem/view
router.get('/view', getMenuItems);

// Truck owner views one of their menu items by id
// GET /api/v1/menuItem/view/:itemId
router.get('/view/:itemId', getMenuItemById);

// Truck owner edits a menu item
// PUT /api/v1/menuItem/edit/:itemId
router.put('/edit/:itemId', updateMenuItem);

// Truck owner "deletes" a menu item
// DELETE /api/v1/menuItem/delete/:itemId
router.delete('/delete/:itemId', deleteMenuItem);

module.exports = router;
