// connectors/db.js

// Make sure environment variables are loaded
require('dotenv').config();

const knex = require('knex');

const db = knex({
  client: 'pg',
  connection: {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'postgres',
    // 🔴 FIX IS HERE: FORCE PASSWORD TO BE A STRING
    password: String(process.env.DB_PASSWORD ?? ''),
    database: process.env.DB_DATABASE || 'foodtruck',
    port: parseInt(process.env.DB_PORT || '5432', 10),
  },
  pool: { min: 0, max: 10 },
});

module.exports = db;
