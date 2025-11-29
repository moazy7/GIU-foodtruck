const db = require('../../connectors/db/knexfile');

// Order controller — builds Orders from a user's cart.
// Consider wrapping the create/insert/clear sequence in a DB transaction.
async function createOrder(req, res) {
  try {
    const { userId, scheduledPickupTime, estimatedEarliestPickup } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }
    // validate userId
    const uid = parseInt(userId, 10);
    if (Number.isNaN(uid)) {
      return res.status(400).json({ error: 'userId must be a number' });
    }

    // Get all cart items for this user joined with MenuItems (to obtain price/truckId)
    const cartItems = await db
      .withSchema('FoodTruck').table('Carts as c')
      .join('MenuItems as m', 'c.itemId', 'm.itemId')
      .where('c.userId', uid)
      .select(
        'c.cartId as cartId',
        'c.itemId as itemId',
        'c.quantity',
        'm.truckId',
        'm.price'
      );

    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    // assume all items are from the same truck (caller should ensure this)
    // If the app permits multi-truck carts, this logic should be adjusted.
    const truckId = cartItems[0].truckId;

    // calculate total
    const total = cartItems.reduce(
      (sum, item) => sum + Number(item.price) * Number(item.quantity),
      0
    );

    // create order
    const insertedOrders = await db
    .withSchema('FoodTruck').table('Orders')
    .insert({
        userId,
        truckId,
        totalPrice: total,          
        orderStatus: 'PENDING',     
        scheduledPickupTime,
        estimatedEarliestPickup,
    })
  .returning('*');

    const order = insertedOrders[0];

    // create order items (bulk insert)
    const orderItemsToInsert = cartItems.map((item) => ({
      orderId: order.orderId,
      itemId: item.itemId,
      quantity: item.quantity,
      price: item.price,
    }));

    await db
      .withSchema('FoodTruck').table('OrderItems')
      .insert(orderItemsToInsert);

    // clear cart for this user
    await db
      .withSchema('FoodTruck').table('Carts')
      .where({ userId: uid })
      .del();

    return res.status(200).json({
      message: 'Order created successfully',
      orderId: order.orderId,
      total,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}

// GET /api/v1/orders/user/:userId
// Get all orders for a user
async function getUserOrders(req, res) {
  try {
    const { userId } = req.params;
    const uid = parseInt(userId, 10);
    if (Number.isNaN(uid)) {
      return res.status(400).json({ error: 'userId must be a number' });
    }

    const orders = await db
      .withSchema('FoodTruck').table('Orders')
      .where({ userId: uid })
      .orderBy('orderId', 'desc');

    return res.status(200).json(orders);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}

// GET /api/v1/orders/:orderId
// Get a single order (optionally you can join items later)
async function getOrderById(req, res) {
  try {
    const { orderId } = req.params;

    const id = parseInt(orderId, 10);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: 'orderId must be a number' });
    }

    const order = await db
      .withSchema('FoodTruck').table('Orders')
      .where({ orderId: id })
      .first();

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // you can also fetch order items if you want:
    const items = await db
      .withSchema('FoodTruck').table('OrderItems')
      .where({ orderId });

    return res.status(200).json({ order, items });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}

// GET /api/v1/orders/truck/:truckId
// All orders for a specific truck (for truck owner)
async function getTruckOrders(req, res) {
  try {
    const { truckId } = req.params;

    const orders = await db
      .withSchema('FoodTruck').table('Orders')
      .where({ truckId })
      .orderBy('orderId', 'desc'); 

    return res.status(200).json(orders);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}

// PUT /api/v1/orders/:orderId/status
// Update the status of an order (PENDING -> ACCEPTED/REJECTED/COMPLETED)
async function updateOrderStatus(req, res) {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const allowedStatuses = ['PENDING', 'ACCEPTED', 'REJECTED', 'COMPLETED'];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }

    const updated = await db
      .withSchema('FoodTruck').table('Orders')
      .where({ orderId })                 
      .update({ orderStatus: status })    
      .returning('*');

    if (!updated || updated.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    return res.status(200).json({
      message: 'Order status updated successfully',
      order: updated[0],
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}

// Update order status scoped to a truck (truck owner can only update their orders)
async function updateTruckOrderStatus(req, res) {
  try {
    const { truckId, orderId } = req.params;
    const { status } = req.body;

    const tid = parseInt(truckId, 10);
    const oid = parseInt(orderId, 10);
    if (Number.isNaN(tid) || Number.isNaN(oid)) {
      return res.status(400).json({ error: 'truckId and orderId must be numbers' });
    }

    const allowedStatuses = ['PENDING', 'ACCEPTED', 'REJECTED', 'COMPLETED'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status value' });
    }

    // Verify the order belongs to this truck
    const order = await db
      .withSchema('FoodTruck').table('Orders')
      .where({ orderId: oid, truckId: tid })
      .first();

    if (!order) {
      return res.status(404).json({ error: 'Order not found for this truck' });
    }

    // Update the order status
    const updated = await db
      .withSchema('FoodTruck').table('Orders')
      .where({ orderId: oid })
      .update({ orderStatus: status })
      .returning('*');

    return res.status(200).json({
      message: 'Order status updated successfully',
      order: updated[0],
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}

module.exports = {
  createOrder,
  getUserOrders,
  getOrderById,
  getTruckOrders,
  updateOrderStatus,
  updateTruckOrderStatus,
};
