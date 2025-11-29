const express = require('express');
const router = express.Router();

const {
  addToCart,
  getCartItems,
  removeFromCart,
} = require('../controllers/cartController');

router.post('/', addToCart);
router.get('/user/:userId', getCartItems);
router.delete('/:cartItemId', removeFromCart);

module.exports = router;
