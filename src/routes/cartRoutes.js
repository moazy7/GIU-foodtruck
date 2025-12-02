// routes/cartRoutes.js
const express = require('express');
const router = express.Router();

const db = require('../../connectors/db/knexfile');

const {
  addToCart,
  getCartItems,
  removeFromCart,
} = require('../controllers/cartController');

// ------------------------
// ORIGINAL ENDPOINTS (KEEPING THEM)
// Base path: /api/v1/cart
// ------------------------

// POST /api/v1/cart
router.post('/', addToCart);

// GET /api/v1/cart/user/:userId
router.get('/user/:userId', getCartItems);

// DELETE /api/v1/cart/:cartItemId
router.delete('/:cartItemId', removeFromCart);

// ------------------------
// MILESTONE 3 ENDPOINTS (ALIASES)
// Base path: /api/v1/cart
// ------------------------

// Add item to cart
// POST /api/v1/cart/new
router.post('/new', addToCart);

// View cart items for a user
// GET /api/v1/cart/view?userId=1
router.get('/view', (req, res) => {
  const { userId } = req.query;
  if (!userId) {
    return res.status(400).json({ error: 'userId is required (query parameter)' });
  }
  // reuse existing controller by setting params
  req.params.userId = userId;
  return getCartItems(req, res);
});

// Edit cart item quantity
// PUT /api/v1/cart/edit/:cartId
router.put('/edit/:cartId', async (req, res) => {
  try {
    const { cartId } = req.params;
    const { quantity } = req.body;

    const id = parseInt(cartId, 10);
    const qty = parseInt(quantity, 10);

    if (Number.isNaN(id)) {
      return res.status(400).json({ error: 'cartId must be a number' });
    }
    if (quantity == null || Number.isNaN(qty)) {
      return res.status(400).json({ error: 'quantity must be a number' });
    }

    const updated = await db
      .withSchema('FoodTruck').table('Carts')
      .where({ cartId: id })
      .update({ quantity: qty })
      .returning('*');

    if (!updated || updated.length === 0) {
      return res.status(404).json({ error: 'Cart item not found' });
    }

    return res.status(200).json({
      message: 'Cart item updated successfully',
      item: updated[0],
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
});

// Delete cart item
// DELETE /api/v1/cart/delete/:cartId
router.delete('/delete/:cartId', (req, res) => {
  // map :cartId to the existing :cartItemId param used by controller
  req.params.cartItemId = req.params.cartId;
  return removeFromCart(req, res);
});

module.exports = router;
