const { v4 } = require('uuid');
const db = require('../../connectors/db');
const axios = require('axios');

function handlePublicBackendApi(app) {

    // Register HTTP endpoint to create new user
    app.post('/api/v1/user', async function(req, res) {
      try {
        console.log('POST /api/v1/user received, body =>', req.body);
        // Check if user already exists in the system
        let userExists;
        try {
          userExists = await db.select('*').from('FoodTruck.Users').where('email', req.body && req.body.email);
        } catch (dbErr) {
          console.error('DB error on userExists check', dbErr && dbErr.stack ? dbErr.stack : dbErr);
          return res.status(500).json({ error: 'db_error', message: dbErr && dbErr.message ? dbErr.message : String(dbErr) });
        }

        if (userExists && userExists.length > 0) {
          return res.status(400).send('user exists');
        }

        // Validate required fields
        if (!req.body || !req.body.name || !req.body.email || !req.body.password) {
          return res.status(400).send('name, email and password are required');
        }

        // Whitelist allowed columns to avoid DB errors from unexpected fields
        const payload = {
          name: req.body.name,
          email: req.body.email,
          password: req.body.password,
          birthDate: req.body.birthDate || null,
        };

        let inserted;
        try {
          inserted = await db('FoodTruck.Users').insert(payload).returning('*');
        } catch (dbErr) {
          console.error('DB error on insert', dbErr && dbErr.stack ? dbErr.stack : dbErr);
          return res.status(500).json({ error: 'db_error', message: dbErr && dbErr.message ? dbErr.message : String(dbErr) });
        }

        return res.status(200).json(inserted);
      } catch (e) {
        console.error('unexpected error in register handler', e && e.stack ? e.stack : e);
        return res.status(500).json({ error: 'unexpected_error', message: e && e.message ? e.message : String(e) });
      }
    });

    // Register HTTP endpoint to create new user
    app.post('/api/v1/user/login', async function(req, res) {
      // get users credentials from the JSON body
      const { email, password } = req.body
      if (!email) {
        // If the email is not present, return an HTTP unauthorized code
        return res.status(400).send('email is required');
      }
      if (!password) {
        // If the password is not present, return an HTTP unauthorized code
        return res.status(400).send('Password is required');
      }

      // validate the provided password against the password in the database
      // if invalid, send an unauthorized code
      let user = await db.select('*').from('FoodTruck.Users').where('email', email);
      if (user.length == 0) {
        return res.status(400).send('user does not exist');
      }
      user = user[0];
      if (user.password !== password) {
        return res.status(400).send('Password does not match');
      }

      // set the expiry time as 30 minutes after the current time
      const token = v4();
      const currentDateTime = new Date();
      const expiresAt = new Date(+currentDateTime + 18000000); // expire in 3 minutes

      // create a session containing information about the user and expiry time
      const session = {
        userId: user.userId,
        token,
        expiresAt,
      };
      try {
        await db('FoodTruck.Sessions').insert(session);
        // In the response, set a cookie on the client with the name "session_cookie"
        // and the value as the UUID we generated. We also set the expiration time.
        axios.defaults.headers.common['Cookie'] = `session_token=${token};expires=${expiresAt}`;
        return res.cookie("session_token", token, { expires: expiresAt }).status(200).send('login successful');
      } catch (e) {
        console.log(e.message);
        return res.status(400).send('Could not register user');
      }
    });




};


module.exports = {handlePublicBackendApi};
