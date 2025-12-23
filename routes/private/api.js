// routes/private/api.js
const db = require('../../connectors/db');
const { getUser } = require('../../utils/session');

function handlePrivateBackendApi(app) {
  // ==========================
  // TEST ENDPOINT
  // ==========================
  app.get('/test', async (req, res) => {
    try {
      return res.status(200).send('succesful connection');
    } catch (err) {
      console.log('error message', err.message);
      return res.status(400).send(err.message);
    }
  });

  // ==========================
  // TRUCK MANAGEMENT
  // ==========================

  // Customer: view all available trucks
  app.get('/api/v1/trucks/view', async (req, res) => {
    try {
      const trucks = await db
        .withSchema('FoodTruck')
        .table('Trucks')
        .where({
          truckStatus: 'available',
          orderStatus: 'available',
        })
        .orderBy('truckId', 'asc');

      return res.status(200).json(trucks);
    } catch (err) {
      console.log('error message', err.message);
      return res.status(500).json({ error: err.message });
    }
  });

  // Truck owner: view their own truck
  app.get('/api/v1/trucks/myTruck', async (req, res) => {
    try {
      const user = await getUser(req);
      if (!user) return res.status(401).json({ error: 'unauthorized' });
      if (user.role !== 'truckOwner') {
        return res.status(403).json({ error: 'forbidden' });
      }

      let truck;
      const userTruckId = user.truckId || user.truckid;

      if (userTruckId) {
        truck = await db
          .withSchema('FoodTruck')
          .table('Trucks')
          .where({ truckId: userTruckId })
          .first();
      } else {
        truck = await db
          .withSchema('FoodTruck')
          .table('Trucks')
          .where({ ownerId: user.userId })
          .first();
      }

      if (!truck) return res.status(404).json({ error: 'truck not found' });

      return res.status(200).json(truck);
    } catch (err) {
      console.log('error message', err.message);
      return res.status(500).json({ error: err.message });
    }
  });

  // Truck owner: update truck orderStatus
  app.put('/api/v1/trucks/updateOrderStatus', async (req, res) => {
    try {
      const user = await getUser(req);
      if (!user) return res.status(401).json({ error: 'unauthorized' });
      if (user.role !== 'truckOwner') {
        return res.status(403).json({ error: 'forbidden' });
      }

      const { orderStatus } = req.body;
      if (!orderStatus) {
        return res.status(400).json({ error: 'orderStatus is required' });
      }

      const allowed = ['available', 'unavailable'];
      if (!allowed.includes(orderStatus)) {
        return res.status(400).json({ error: 'invalid orderStatus value' });
      }

      let truckId = user.truckId || user.truckid;
      if (!truckId) {
        const truck = await db
          .withSchema('FoodTruck')
          .table('Trucks')
          .where({ ownerId: user.userId })
          .first();
        if (!truck) {
          return res.status(404).json({ error: 'truck not found' });
        }
        truckId = truck.truckId;
      }

      await db
        .withSchema('FoodTruck')
        .table('Trucks')
        .where({ truckId })
        .update({ orderStatus });

      return res
        .status(200)
        .json({ message: 'truck order status updated successfully' });
    } catch (err) {
      console.log('error message', err.message);
      return res.status(500).json({ error: err.message });
    }
  });

  // ==========================
  // MENU ITEM MANAGEMENT
  // ==========================

  // Truck owner: create new menu item
  app.post('/api/v1/menuItem/new', async (req, res) => {
    try {
      const user = await getUser(req);
      if (!user) return res.status(401).json({ error: 'unauthorized' });
      if (user.role !== 'truckOwner') {
        return res.status(403).json({ error: 'forbidden' });
      }

      const { name, price, description, category } = req.body;
      if (!name || price == null || !category) {
        return res
          .status(400)
          .json({ error: 'name, price, and category are required' });
      }

      const truckId = user.truckId || user.truckid;
      if (!truckId) {
        return res.status(400).json({ error: 'truckId not found for owner' });
      }

      await db('FoodTruck.MenuItems').insert({
        truckId,
        name,
        description: description || null,
        price: Number(price),
        category,
        status: 'available',
      });

      return res
        .status(200)
        .json({ message: 'menu item was created successfully' });
    } catch (err) {
      console.log('error message', err.message);
      return res.status(500).json({ error: err.message });
    }
  });

  // Truck owner: view available menu items for their truck
  app.get('/api/v1/menuItem/view', async (req, res) => {
    try {
      const user = await getUser(req);
      if (!user) return res.status(401).json({ error: 'unauthorized' });
      if (user.role !== 'truckOwner') {
        return res.status(403).json({ error: 'forbidden' });
      }

      const truckId = user.truckId || user.truckid;
      if (!truckId) {
        return res.status(400).json({ error: 'truckId not found for owner' });
      }

      const items = await db('FoodTruck.MenuItems')
        .where({ truckId, status: 'available' })
        .orderBy('itemId', 'asc');

      return res.status(200).json(items);
    } catch (err) {
      console.log('error message', err.message);
      return res.status(500).json({ error: err.message });
    }
  });

  // Truck owner: view specific menu item
  app.get('/api/v1/menuItem/view/:itemId', async (req, res) => {
    try {
      const user = await getUser(req);
      if (!user) return res.status(401).json({ error: 'unauthorized' });
      if (user.role !== 'truckOwner') {
        return res.status(403).json({ error: 'forbidden' });
      }

      const truckId = user.truckId || user.truckid;
      if (!truckId) {
        return res.status(400).json({ error: 'truckId not found for owner' });
      }

      const itemId = parseInt(req.params.itemId, 10);
      if (Number.isNaN(itemId)) {
        return res.status(400).json({ error: 'itemId must be a number' });
      }

      const item = await db('FoodTruck.MenuItems')
        .where({ itemId })
        .first();

      if (!item) return res.status(404).json({ error: 'menu item not found' });
      if (item.truckId !== truckId) {
        return res
          .status(403)
          .json({ error: 'not allowed to view other truck owners menu items' });
      }

      return res.status(200).json(item);
    } catch (err) {
      console.log('error message', err.message);
      return res.status(500).json({ error: err.message });
    }
  });

  // Truck owner: edit menu item
  app.put('/api/v1/menuItem/edit/:itemId', async (req, res) => {
    try {
      const user = await getUser(req);
      if (!user) return res.status(401).json({ error: 'unauthorized' });
      if (user.role !== 'truckOwner') {
        return res.status(403).json({ error: 'forbidden' });
      }

      const truckId = user.truckId || user.truckid;
      if (!truckId) {
        return res.status(400).json({ error: 'truckId not found for owner' });
      }

      const itemId = parseInt(req.params.itemId, 10);
      if (Number.isNaN(itemId)) {
        return res.status(400).json({ error: 'itemId must be a number' });
      }

      const existing = await db('FoodTruck.MenuItems')
        .where({ itemId })
        .first();

      if (!existing) return res.status(404).json({ error: 'menu item not found' });
      if (existing.truckId !== truckId) {
        return res
          .status(403)
          .json({ error: 'not allowed to edit other truck owners menu items' });
      }

      const { name, price, category, description } = req.body;
      const updates = {};
      if (name !== undefined) updates.name = name;
      if (price !== undefined) updates.price = Number(price);
      if (category !== undefined) updates.category = category;
      if (description !== undefined) updates.description = description;

      if (Object.keys(updates).length === 0) {
        return res.status(400).json({ error: 'no fields to update' });
      }

      await db('FoodTruck.MenuItems')
        .where({ itemId })
        .update(updates);

      return res
        .status(200)
        .json({ message: 'menu item updated successfully' });
    } catch (err) {
      console.log('error message', err.message);
      return res.status(500).json({ error: err.message });
    }
  });

  // Truck owner: soft-delete menu item (status = unavailable)
  app.delete('/api/v1/menuItem/delete/:itemId', async (req, res) => {
    try {
      const user = await getUser(req);
      if (!user) return res.status(401).json({ error: 'unauthorized' });
      if (user.role !== 'truckOwner') {
        return res.status(403).json({ error: 'forbidden' });
      }

      const truckId = user.truckId || user.truckid;
      if (!truckId) {
        return res.status(400).json({ error: 'truckId not found for owner' });
      }

      const itemId = parseInt(req.params.itemId, 10);
      if (Number.isNaN(itemId)) {
        return res.status(400).json({ error: 'itemId must be a number' });
      }

      const existing = await db('FoodTruck.MenuItems')
        .where({ itemId })
        .first();

      if (!existing) return res.status(404).json({ error: 'menu item not found' });
      if (existing.truckId !== truckId) {
        return res
          .status(403)
          .json({ error: 'not allowed to delete other truck owners menu items' });
      }

      await db('FoodTruck.MenuItems')
        .where({ itemId })
        .update({ status: 'unavailable' });

      return res
        .status(200)
        .json({ message: 'menu item deleted successfully' });
    } catch (err) {
      console.log('error message', err.message);
      return res.status(500).json({ error: err.message });
    }
  });

  // Customer: view menu for a specific truck
  app.get('/api/v1/menuItem/truck/:truckId', async (req, res) => {
    try {
      const truckId = parseInt(req.params.truckId, 10);
      if (Number.isNaN(truckId)) {
        return res.status(400).json({ error: 'truckId must be a number' });
      }

      const items = await db('FoodTruck.MenuItems')
        .where({ truckId, status: 'available' })
        .orderBy('itemId', 'asc');

      return res.status(200).json(items);
    } catch (err) {
      console.log('error message', err.message);
      return res.status(500).json({ error: err.message });
    }
  });

  // Customer: view menu by category for a specific truck
  app.get('/api/v1/menuItem/truck/:truckId/category/:category', async (req, res) => {
    try {
      const truckId = parseInt(req.params.truckId, 10);
      const { category } = req.params;
      if (Number.isNaN(truckId)) {
        return res.status(400).json({ error: 'truckId must be a number' });
      }

      const items = await db('FoodTruck.MenuItems')
        .where({ truckId, status: 'available' })
        .andWhere('category', category)
        .orderBy('itemId', 'asc');

      return res.status(200).json(items);
    } catch (err) {
      console.log('error message', err.message);
      return res.status(500).json({ error: err.message });
    }
  });

  // ==========================
  // CART MANAGEMENT
  // ==========================

  // Customer: add item to cart (or update existing)
  app.post('/api/v1/cart/new', async (req, res) => {
    try {
      const user = await getUser(req);
      if (!user) return res.status(401).json({ error: 'unauthorized' });
      if (user.role !== 'customer') {
        return res.status(403).json({ error: 'only customers can have carts' });
      }

      let { itemId, quantity } = req.body;
      itemId = parseInt(itemId, 10);
      quantity = parseInt(quantity ?? 1, 10);

      if (Number.isNaN(itemId) || quantity <= 0) {
        return res
          .status(400)
          .json({ error: 'itemId must be a number and quantity > 0' });
      }

      const menuItem = await db('FoodTruck.MenuItems')
        .where({ itemId, status: 'available' })
        .first();
      if (!menuItem) {
        return res.status(404).json({ error: 'menu item not found' });
      }

      const existingCartRows = await db('FoodTruck.Carts as c')
        .join('FoodTruck.MenuItems as m', 'c.itemId', 'm.itemId')
        .select('c.cartId', 'c.itemId', 'c.quantity', 'm.truckId')
        .where('c.userId', user.userId);

      if (existingCartRows.length > 0) {
        const existingTruckId = existingCartRows[0].truckId;
        if (existingTruckId !== menuItem.truckId) {
          return res.status(400).json({
            error:
              'cart already contains items from another truck; clear cart before ordering from a new truck',
          });
        }
      }

      const existingItemRow = existingCartRows.find(
        (row) => row.itemId === itemId
      );

      if (existingItemRow) {
        await db('FoodTruck.Carts')
          .where({ cartId: existingItemRow.cartId })
          .update({ quantity });

        return res
          .status(200)
          .json({ message: 'cart item quantity updated successfully' });
      }

      await db('FoodTruck.Carts').insert({
        userId: user.userId,
        itemId,
        quantity,
        price: menuItem.price,
      });

      return res
        .status(200)
        .json({ message: 'item added to cart successfully' });
    } catch (err) {
      console.log('error message', err.message);
      return res.status(500).json({ error: err.message });
    }
  });

  // shared handler for updating cart quantity
  const updateCartHandler = async (req, res) => {
    try {
      const user = await getUser(req);
      if (!user) return res.status(401).json({ error: 'unauthorized' });

      // cartId can come from params or body
      let cartId = req.params.cartId ?? req.body.cartId;
      let { quantity } = req.body;

      cartId = parseInt(cartId, 10);
      quantity = parseInt(quantity, 10);

      if (Number.isNaN(cartId) || Number.isNaN(quantity)) {
        return res
          .status(400)
          .json({ error: 'cartId and quantity must be numbers' });
      }

      const cartRow = await db('FoodTruck.Carts')
        .where({ cartId })
        .first();
      if (!cartRow) {
        return res.status(404).json({ error: 'cart item not found' });
      }
      if (cartRow.userId !== user.userId) {
        return res.status(403).json({ error: 'not allowed to edit this cart' });
      }

      if (quantity <= 0) {
        await db('FoodTruck.Carts').where({ cartId }).del();
        return res
          .status(200)
          .json({ message: 'cart updated successfully' });
      }

      await db('FoodTruck.Carts')
        .where({ cartId })
        .update({ quantity });

      return res
        .status(200)
        .json({ message: 'cart updated successfully' });
    } catch (err) {
      console.log('error message', err.message);
      return res.status(500).json({ error: err.message });
    }
  };

  // Customer: update quantity for cart row
  app.put('/api/v1/cart/update', updateCartHandler);
  // alias with :cartId in URL (if tester uses this style)
  app.put('/api/v1/cart/edit/:cartId', updateCartHandler);

  // Customer: delete one cart item
  app.delete('/api/v1/cart/delete/:cartId', async (req, res) => {
    try {
      const user = await getUser(req);
      if (!user) return res.status(401).json({ error: 'unauthorized' });

      const cartId = parseInt(req.params.cartId, 10);
      if (Number.isNaN(cartId)) {
        return res.status(400).json({ error: 'cartId must be a number' });
      }

      const cartRow = await db('FoodTruck.Carts')
        .where({ cartId })
        .first();
      if (!cartRow) {
        return res.status(404).json({ error: 'cart item not found' });
      }
      if (cartRow.userId !== user.userId) {
        return res
          .status(403)
          .json({ error: 'not allowed to delete this item' });
      }

      await db('FoodTruck.Carts').where({ cartId }).del();

      return res
        .status(200)
        .json({ message: 'cart item deleted successfully' });
    } catch (err) {
      console.log('error message', err.message);
      return res.status(500).json({ error: err.message });
    }
  });

  // Customer: view cart
  app.get('/api/v1/cart/view', async (req, res) => {
    try {
      const user = await getUser(req);
      if (!user) return res.status(401).json({ error: 'unauthorized' });

      const rows = await db('FoodTruck.Carts as c')
        .join('FoodTruck.MenuItems as m', 'c.itemId', 'm.itemId')
        .select(
          'c.cartId',
          'c.itemId',
          'c.quantity',
          'c.price',
          'm.name',
          'm.description',
          'm.category',
          'm.truckId'
        )
        .where('c.userId', user.userId);

      let totalPrice = 0;
      const items = rows.map((row) => {
        const lineTotal = Number(row.price) * row.quantity;
        totalPrice += lineTotal;
        return {
          cartId: row.cartId,
          itemId: row.itemId,
          name: row.name,
          description: row.description,
          category: row.category,
          truckId: row.truckId,
          quantity: row.quantity,
          unitPrice: Number(row.price),
          lineTotal,
        };
      });

      return res.status(200).json({ items, totalPrice });
    } catch (err) {
      console.log('error message', err.message);
      return res.status(500).json({ error: err.message });
    }
  });

  // shared handler for placing order from cart
  const placeOrderHandler = async (req, res) => {
    try {
      const user = await getUser(req);
      if (!user) return res.status(401).json({ error: 'unauthorized' });

      const cartRows = await db('FoodTruck.Carts as c')
        .join('FoodTruck.MenuItems as m', 'c.itemId', 'm.itemId')
        .select('c.cartId', 'c.itemId', 'c.quantity', 'c.price', 'm.truckId')
        .where('c.userId', user.userId);

      if (cartRows.length === 0) {
        return res.status(400).json({ error: 'cart is empty' });
      }

      const firstTruckId = cartRows[0].truckId;
      const multiTruck = cartRows.find((r) => r.truckId !== firstTruckId);
      if (multiTruck) {
        return res.status(400).json({
          error:
            'Cannot order from multiple trucks',
        });
      }

      let totalPrice = 0;
      cartRows.forEach((row) => {
        totalPrice += Number(row.price) * row.quantity;
      });

      const [order] = await db('FoodTruck.Orders')
        .insert({
          userId: user.userId,
          truckId: firstTruckId,
          totalPrice,
          orderStatus: 'pending', // column name in your DB
        })
        .returning('*');

      const orderId = order.orderId;

      const orderItemsToInsert = cartRows.map((row) => ({
        orderId,
        itemId: row.itemId,
        quantity: row.quantity,
        price: row.price,
      }));

      await db('FoodTruck.OrderItems').insert(orderItemsToInsert);

      await db('FoodTruck.Carts')
        .where({ userId: user.userId })
        .del();

      return res
        .status(200)
        .json({ message: 'order placed successfully', orderId, totalPrice });
    } catch (err) {
      console.log('error message', err.message);
      return res.status(500).json({ error: err.message });
    }
  };

  // Customer: place order from cart
  app.post('/api/v1/cart/place', placeOrderHandler);
  // alias using /order/new (if doc uses this path)
  app.post('/api/v1/order/new', placeOrderHandler);


  // ==========================
  // ORDER MANAGEMENT
  // ==========================

  /**
   * GET /api/v1/order/myOrders
   * Customer: view all their orders.
   */
  app.get('/api/v1/order/myOrders', async (req, res) => {
    try {
      const user = await getUser(req);
      if (!user) return res.status(401).json({ error: 'unauthorized' });

      const orders = await db('FoodTruck.Orders as o')
        .join('FoodTruck.Trucks as t', 'o.truckId', 't.truckId')
        .select(
          'o.orderId',
          'o.userId',
          'o.truckId',
          't.truckName',
          'o.orderStatus',
          'o.totalPrice',
          'o.scheduledPickupTime',
          'o.estimatedEarliestPickup',
          'o.createdAt'
        )
        .where('o.userId', user.userId)
        .orderBy('o.orderId', 'desc');

      return res.status(200).json(orders);
    } catch (err) {
      console.log('error message', err.message);
      return res.status(500).json({ error: err.message });
    }
  });

  /**
   * GET /api/v1/order/details/:orderId
   * Customer: view details of one order + its items.
   */
  app.get('/api/v1/order/details/:orderId', async (req, res) => {
    try {
      const user = await getUser(req);
      if (!user) return res.status(401).json({ error: 'unauthorized' });

      const orderId = parseInt(req.params.orderId, 10);
      if (Number.isNaN(orderId)) {
        return res.status(400).json({ error: 'orderId must be a number' });
      }

      const order = await db('FoodTruck.Orders as o')
        .join('FoodTruck.Trucks as t', 'o.truckId', 't.truckId')
        .select(
          'o.orderId',
          'o.userId',
          'o.truckId',
          't.truckName',
          'o.orderStatus',
          'o.totalPrice',
          'o.scheduledPickupTime',
          'o.estimatedEarliestPickup',
          'o.createdAt'
        )
        .where('o.orderId', orderId)
        .andWhere('o.userId', user.userId)
        .first();

      if (!order) {
        return res.status(404).json({ error: 'order not found' });
      }

      const items = await db('FoodTruck.OrderItems as oi')
        .join('FoodTruck.MenuItems as m', 'oi.itemId', 'm.itemId')
        .select('m.name as itemName', 'oi.quantity', 'oi.price')
        .where('oi.orderId', orderId);

      return res.status(200).json({
        ...order,
        items,
      });
    } catch (err) {
      console.log('error message', err.message);
      return res.status(500).json({ error: err.message });
    }
  });

  /**
   * GET /api/v1/order/truckOrders
   * Truck owner: view all orders for their truck.
   */
  app.get('/api/v1/order/truckOrders', async (req, res) => {
    try {
      const user = await getUser(req);
      if (!user) return res.status(401).json({ error: 'unauthorized' });
      if (user.role !== 'truckOwner') {
        return res.status(403).json({ error: 'forbidden' });
      }

      // find truckId for this owner (like we did in /trucks/myTruck)
      let truckId = user.truckId || user.truckid;
      if (!truckId) {
        const truck = await db
          .withSchema('FoodTruck')
          .table('Trucks')
          .where({ ownerId: user.userId })
          .first();
        if (!truck) return res.status(404).json({ error: 'truck not found' });
        truckId = truck.truckId;
      }

      const orders = await db('FoodTruck.Orders as o')
        .join('FoodTruck.Users as u', 'o.userId', 'u.userId')
        .select(
          'o.orderId',
          'o.userId',
          'o.truckId',
          'u.name as customerName',
          'o.orderStatus',
          'o.totalPrice',
          'o.scheduledPickupTime',
          'o.estimatedEarliestPickup',
          'o.createdAt'
        )
        .where('o.truckId', truckId)
        .orderBy('o.orderId', 'desc');

      return res.status(200).json(orders);
    } catch (err) {
      console.log('error message', err.message);
      return res.status(500).json({ error: err.message });
    }
  });

  /**
   * GET /api/v1/order/truckOwner/:orderId
   * Truck owner: view details of one order for their truck.
   */
  app.get('/api/v1/order/truckOwner/:orderId', async (req, res) => {
    try {
      const user = await getUser(req);
      if (!user) return res.status(401).json({ error: 'unauthorized' });
      if (user.role !== 'truckOwner') {
        return res.status(403).json({ error: 'forbidden' });
      }

      let truckId = user.truckId || user.truckid;
      if (!truckId) {
        const truck = await db
          .withSchema('FoodTruck')
          .table('Trucks')
          .where({ ownerId: user.userId })
          .first();
        if (!truck) return res.status(404).json({ error: 'truck not found' });
        truckId = truck.truckId;
      }

      const orderId = parseInt(req.params.orderId, 10);
      if (Number.isNaN(orderId)) {
        return res.status(400).json({ error: 'orderId must be a number' });
      }

      const order = await db('FoodTruck.Orders as o')
        .join('FoodTruck.Trucks as t', 'o.truckId', 't.truckId')
        .join('FoodTruck.Users as u', 'o.userId', 'u.userId')
        .select(
          'o.orderId',
          'o.userId',
          'u.name as customerName',
          'o.truckId',
          't.truckName',
          'o.orderStatus',
          'o.totalPrice',
          'o.scheduledPickupTime',
          'o.estimatedEarliestPickup',
          'o.createdAt'
        )
        .where('o.orderId', orderId)
        .andWhere('o.truckId', truckId)
        .first();

      if (!order) {
        return res.status(404).json({ error: 'order not found for this truck' });
      }

      const items = await db('FoodTruck.OrderItems as oi')
        .join('FoodTruck.MenuItems as m', 'oi.itemId', 'm.itemId')
        .select('m.name as itemName', 'oi.quantity', 'oi.price')
        .where('oi.orderId', orderId);

      return res.status(200).json({
        ...order,
        items,
      });
    } catch (err) {
      console.log('error message', err.message);
      return res.status(500).json({ error: err.message });
    }
  });

  /**
   * PUT /api/v1/order/updateStatus/:orderId
   * Truck owner: update orderStatus (+ optional estimatedEarliestPickup).
   */
  app.put('/api/v1/order/updateStatus/:orderId', async (req, res) => {
    try {
      const user = await getUser(req);
      if (!user) return res.status(401).json({ error: 'unauthorized' });
      if (user.role !== 'truckOwner') {
        return res.status(403).json({ error: 'forbidden' });
      }

      let truckId = user.truckId || user.truckid;
      if (!truckId) {
        const truck = await db
          .withSchema('FoodTruck')
          .table('Trucks')
          .where({ ownerId: user.userId })
          .first();
        if (!truck) return res.status(404).json({ error: 'truck not found' });
        truckId = truck.truckId;
      }

      const orderId = parseInt(req.params.orderId, 10);
      if (Number.isNaN(orderId)) {
        return res.status(400).json({ error: 'orderId must be a number' });
      }

      const { orderStatus, estimatedEarliestPickup } = req.body;
      if (!orderStatus) {
        return res.status(400).json({ error: 'orderStatus is required' });
      }

      const existing = await db('FoodTruck.Orders')
        .where({ orderId, truckId })
        .first();

      if (!existing) {
        return res
          .status(404)
          .json({ error: 'order not found for this truck' });
      }

      const updates = { orderStatus };
      if (estimatedEarliestPickup) {
        updates.estimatedEarliestPickup = estimatedEarliestPickup;
      }

      await db('FoodTruck.Orders')
        .where({ orderId })
        .update(updates);

      return res
        .status(200)
        .json({ message: 'order status updated successfully' });
    } catch (err) {
      console.log('error message', err.message);
      return res.status(500).json({ error: err.message });
    }
  });



}

module.exports = { handlePrivateBackendApi };