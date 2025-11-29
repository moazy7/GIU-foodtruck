const db = require('../../connectors/db/knexfile');

// POST /api/v1/cart/add
// Add an item to the cart
async function addToCart(req, res) {
  try {
    const { userId, menuItemId, quantity } = req.body;

    if (userId == null || menuItemId == null || quantity == null) {
      return res
        .status(400)
        .json({ error: 'userId, menuItemId and quantity are required' });
    }

    const uid = parseInt(userId, 10);
    const itemId = parseInt(menuItemId, 10);
    const qty = parseInt(quantity, 10);
    if (Number.isNaN(uid) || Number.isNaN(itemId) || Number.isNaN(qty)) {
      return res.status(400).json({ error: 'userId, menuItemId and quantity must be numbers' });
    }

    // fetch item price (price is NOT NULL in schema)
    const menuItem = await db
      .withSchema('FoodTruck').table('MenuItems')
      .where({ itemId: itemId })
      .first();

    if (!menuItem) {
      return res.status(404).json({ error: 'menu item not found' });
    }

    await db.withSchema('FoodTruck').table('Carts').insert({
      userId: uid,
      itemId: itemId,
      quantity: qty,
      price: menuItem.price,
    });

    return res
      .status(200)
      .json({ message: 'Item added to cart successfully' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}

// GET /api/v1/cart/view/:userId
// Get all items in a user's cart
async function getCartItems(req, res) {
  try {
    const { userId } = req.params;

    const id = parseInt(userId, 10);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: 'userId must be a number' });
    }

    const items = await db
      .withSchema('FoodTruck').table('Carts')
      .where({ userId: id })
      .select('*');

    return res.status(200).json(items);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}

// DELETE /api/v1/cart/remove/:cartItemId
// Remove an item from the cart
async function removeFromCart(req, res) {
  try {
    const { cartItemId } = req.params;

    const id = parseInt(cartItemId, 10);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: 'cartItemId must be a number' });
    }

    const deleted = await db
      .withSchema('FoodTruck').table('Carts')
      .where({ cartId: id })
      .del();

    if (deleted === 0) {
      return res.status(404).json({ error: 'Cart item not found' });
    }

    return res
      .status(200)
      .json({ message: 'Item removed from cart successfully' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}

module.exports = {
  addToCart,
  getCartItems,
  removeFromCart,
};
