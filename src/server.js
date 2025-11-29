require('dotenv').config();
const menuItemRoutes = require('./routes/menuItemRoutes');
const truckRoutes = require('./routes/truckRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const express = require('express');
const app = express();

// Import DB helper
const db = require('../connectors/db/knexfile');

app.use(express.json());

// Default route
app.get('/', (req, res) => {
  res.send('Backend is running!');
});

// DB test route
app.get('/test-db', async (req, res) => {
  try {
    const result = await db.raw('SELECT NOW()');  
    res.json({
      success: true,
      time: result.rows[0].now
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.use('/api/v1/menuItem', menuItemRoutes);
app.use('/api/v1/trucks', truckRoutes);
app.use('/api/v1/cart', cartRoutes);
app.use('/api/v1/orders', orderRoutes);
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
