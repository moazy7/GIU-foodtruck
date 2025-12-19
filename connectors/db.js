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
  pool: {
    min: 0,
    // Allow configuring pool size via env var; default to 10
    max: parseInt(process.env.DB_POOL_MAX || '10', 10),
    // Increase timeouts so transient spikes don't immediately fail
    acquireTimeoutMillis: parseInt(process.env.DB_ACQUIRE_TIMEOUT_MS || '60000', 10),
    createTimeoutMillis: parseInt(process.env.DB_CREATE_TIMEOUT_MS || '30000', 10),
    idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT_MS || '30000', 10),
  },
});

module.exports = db;

// Ensure the pool is cleanly destroyed on process exit to avoid leaked handles
function shutdown() {
  if (db && typeof db.destroy === 'function') {
    db.destroy().catch(() => {});
  }
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
process.on('exit', shutdown);
