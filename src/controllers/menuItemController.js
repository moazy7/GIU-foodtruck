const db = require('../../connectors/db/knexfile');
// Truck owner creates a new menu item
async function createMenuItem(req, res) {
  try {
    // TODO: later: use getUser() to get logged-in user
    const { name, price, description, category, truckId } = req.body;

    if (!name || price == null || !category || !truckId) {
      return res.status(400).json({ error: 'name, price, category, truckId are required' });
    }

    await db.withSchema('FoodTruck').table('MenuItems').insert({
      name,
      price,
      description,
      category,
      truckId
    }).returning(['itemId']);

    return res.status(200).json({ message: 'menu item was created successfully'});
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}
// Get all menu items for a given truck
async function getMenuItems(req, res) {
  try {
    const { truckId } = req.query; // we pass ?truckId=1 in URL for now

    if (!truckId) {
      return res.status(400).json({ error: 'truckId is required' });
    }

    const items = await db
      .withSchema('FoodTruck').table('MenuItems')
      .where({ truckId })
      .orderBy('itemId', 'asc');

    return res.status(200).json(items);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}

// Get a single menu item by its id
async function getMenuItemById(req, res) {
  try {
    const { itemId } = req.params;

    const id = parseInt(itemId, 10);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: 'itemId must be a number' });
    }

    const item = await db
      .withSchema('FoodTruck').table('MenuItems')
      .where({ itemId: id })
      .first();

    if (!item) {
      return res.status(404).json({ error: 'menu item not found' });
    }

    return res.status(200).json(item);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}

// Update an existing menu item
async function updateMenuItem(req, res) {
  try {
    const { itemId } = req.params;
    const { name, price, description, category } = req.body;

    // validate itemId is numeric
    const id = parseInt(itemId, 10);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: 'itemId must be a number' });
    }

    // Build an object with only the fields that were sent
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (price !== undefined) updateData.price = price;
    if (description !== undefined) updateData.description = description;
    if (category !== undefined) updateData.category = category;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    const updated = await db
      .withSchema('FoodTruck').table('MenuItems')
      .where({ itemId: id })
      .update(updateData)
      .returning('*');

    if (!updated || updated.length === 0) {
      return res.status(404).json({ error: 'menu item not found' });
    }

    return res.status(200).json({
      message: 'menu item was updated successfully',
      item: updated[0],
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}

// Delete a menu item
async function deleteMenuItem(req, res) {
  try {
    const { itemId } = req.params;

    // validate itemId and coerce to integer
    const id = parseInt(itemId, 10);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: 'itemId must be a number' });
    }

    const deletedCount = await db
      .withSchema('FoodTruck').table('MenuItems')
      .where({ itemId: id })
      .del();

    if (deletedCount === 0) {
      return res.status(404).json({ error: 'menu item not found' });
    }

    return res.status(200).json({ message: 'menu item was deleted successfully' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}

// Get all menu items for a specific truck (public browse)
async function getTruckMenu(req, res) {
  try {
    const { truckId } = req.params; // from /truck/:truckId

    const id = parseInt(truckId, 10);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: 'truckId must be a number' });
    }

    const items = await db
      .withSchema('FoodTruck').table('MenuItems')
      .where({ truckId: id })
      .orderBy('itemId', 'asc');

    return res.status(200).json(items);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}

// Get menu items for a specific truck and category
async function getTruckMenuByCategory(req, res) {
  try {
    const { truckId, category } = req.params; // from /truck/:truckId/category/:category

    const id = parseInt(truckId, 10);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: 'truckId must be a number' });
    }

    if (!category) {
      return res.status(400).json({ error: 'category is required' });
    }

    const items = await db
      .withSchema('FoodTruck').table('MenuItems')
      .where({ truckId: id, category })
      .orderBy('itemId', 'asc');

    return res.status(200).json(items);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}




module.exports = {
    createMenuItem,
    getMenuItems,
    getMenuItemById,
    updateMenuItem,
    deleteMenuItem,
    getTruckMenu,
    getTruckMenuByCategory,
};



