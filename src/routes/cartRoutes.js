const express = require('express');
const router = express.Router();

const {
  addToCart,
  getCartItems,
  removeFromCart,
} = require('../controllers/cartController');

// POST /api/v1/cart/add
router.post('/add', addToCart);

// GET /api/v1/cart/view/:userId
router.get('/view/:userId', getCartItems);

// DELETE /api/v1/cart/remove/:cartItemId
router.delete('/remove/:cartItemId', removeFromCart);

module.exports = router;
