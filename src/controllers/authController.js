// src/controllers/authController.js
const db = require('../../connectors/db/knexfile');
const { v4: uuidv4 } = require('uuid');

// GET /register  → show simple HTML form
async function showRegisterForm(req, res) {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Register</title>
        <meta charset="UTF-8" />
      </head>
      <body>
        <h1>Register</h1>
        <form method="POST" action="/register">
          <div>
            <label>Name:</label>
            <input type="text" name="name" required />
          </div>
          <div>
            <label>Email:</label>
            <input type="email" name="email" required />
          </div>
          <div>
            <label>Password:</label>
            <input type="password" name="password" required />
          </div>
          <div>
            <label>Role:</label>
            <select name="role">
              <option value="customer" selected>Customer</option>
              <option value="truckOwner">Truck Owner</option>
            </select>
          </div>
          <button type="submit">Register</button>
        </form>
      </body>
    </html>
  `;
  res.send(html);
}

// POST /register  → insert into FoodTruck.Users
async function registerUser(req, res) {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).send('name, email, and password are required');
    }

    const userRole = role || 'customer';

    // Check if email already exists
    const existing = await db
      .withSchema('FoodTruck')
      .table('Users')
      .where({ email })
      .first();

    if (existing) {
      return res
        .status(400)
        .send('Email already registered. Please use another email.');
    }

    const inserted = await db
      .withSchema('FoodTruck')
      .table('Users')
      .insert({
        name,
        email,
        password, // for milestone, plain text is okay
        role: userRole,
      })
      .returning(['userId', 'name', 'email', 'role']);

    const user = Array.isArray(inserted) ? inserted[0] : inserted;

    // Simple success HTML
    return res.send(`
      <h2>Registration successful</h2>
      <p>You can now login from Thunder Client using:</p>
      <pre>${email}</pre>
      <a href="/register">Back to Register</a>
    `);
  } catch (err) {
    console.error(err);
    return res.status(500).send('Internal server error: ' + err.message);
  }
}

// GET /api/v1/user/login  (ThunderClient)
// body: { "email": "...", "password": "..." }
async function loginUser(req, res) {
  try {
    const { email, password } = req.body; // ThunderClient sends JSON body

    if (!email || !password) {
      return res.status(400).json({ error: 'email and password are required' });
    }

    const user = await db
      .withSchema('FoodTruck')
      .table('Users')
      .where({ email })
      .first();

    if (!user || user.password !== password) {
      return res.status(401).json({ error: 'invalid email or password' });
    }

    // create a session token valid for ~5 hours
    const token = uuidv4();
    const expiresAt = new Date(Date.now() + 5 * 60 * 60 * 1000); // 5 hours

    await db
      .withSchema('FoodTruck')
      .table('Sessions')
      .insert({
        userId: user.userid || user.userId, // depending on how pg returns it
        token,
        expiresAt,
      });

    return res.status(200).json({
      message: 'login successful',
      token,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}

module.exports = {
  showRegisterForm,
  registerUser,
  loginUser,
};
