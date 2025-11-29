require('dotenv').config();
const knex = require('knex');

const db = knex({
  client: 'pg',
  connection: {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    // Support both DB_NAME and DB_DATABASE env var names
    database: process.env.DB_NAME || process.env.DB_DATABASE,
    port: process.env.DB_PORT || 5432,
  },
});

module.exports = db;
