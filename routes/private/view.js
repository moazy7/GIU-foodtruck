const axios = require('axios');
require('dotenv').config();

const { getUser, getSessionToken } = require('../../utils/session');
const db = require('../../connectors/db');
const { authMiddleware } = require('../../middleware/auth');

const PORT = process.env.PORT || 3001;

function handlePrivateFrontEndView(app) {
  // ===== Dashboard: customer vs owner =====
  app.get('/dashboard', authMiddleware, async (req, res) => {
    try {
      const user = await getUser(req);

      if (user && user.role === 'truckOwner') {
        return res.redirect('/ownerDashboard');
      }

      return res.render('customerHomepage', { name: user?.name || '' });
    } catch (err) {
      console.error('Dashboard error:', err);
      return res.status(500).send('Dashboard error');
    }
  });

  // ===== Logout (CORRECT for your session_token + DB Sessions) =====
  app.get('/logout', async (req, res) => {
    try {
      const token = getSessionToken(req);

      if (token) {
        await db('FoodTruck.Sessions').where({ token }).del();
      }

      // Clear cookie session_token
      res.setHeader('Set-Cookie', 'session_token=; HttpOnly; Path=/; Max-Age=0');

      // Your authMiddleware redirects unauth users to '/' so we send them there
      return res.redirect('/');
    } catch (err) {
      console.error('Logout error:', err);
      return res.status(500).send('Logout failed');
    }
  });

  // ===== Customer pages =====
  app.get('/trucks', authMiddleware, (req, res) => res.render('trucks'));
  app.get('/truckMenu/:truckId', authMiddleware, (req, res) =>
    res.render('truckMenu', { truckId: req.params.truckId })
  );
  app.get('/cart', authMiddleware, (req, res) => res.render('cart'));
  app.get('/myOrders', authMiddleware, (req, res) => res.render('myOrders'));

  // ===== Owner pages =====
  app.get('/ownerDashboard', authMiddleware, (req, res) => res.render('ownerDashboard'));
  app.get('/menuItems', authMiddleware, (req, res) => res.render('menuItems'));
  app.get('/addMenuItem', authMiddleware, (req, res) => res.render('addMenuItem'));
  app.get('/truckOrders', authMiddleware, (req, res) => res.render('truckOrders'));

  // ===== Testing (keep if you use it) =====
  app.get('/testingAxios', authMiddleware, async (req, res) => {
    try {
      const result = await axios.get(`http://localhost:${PORT}/test`);
      return res.status(200).send(result.data);
    } catch (error) {
      console.log('error message', error.message);
      return res.status(400).send(error.message);
    }
  });
}

module.exports = { handlePrivateFrontEndView };
