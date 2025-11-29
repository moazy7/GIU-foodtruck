require('dotenv').config();
const fs = require('fs');
const path = require('path');
const knex = require('knex');

// DB initializer — runs `connectors/script.sql` to create the `FoodTruck` schema/tables.
// Intended for development; back up data before running in production.
const db = knex({
  client: 'pg',
  connection: {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: 'postgres', // Connect to default postgres database
    port: process.env.DB_PORT || 5432,
  },
});

async function initializeDatabase() {
  try {
    console.log('Reading SQL script...');
    const sqlScript = fs.readFileSync(path.join(__dirname, 'script.sql'), 'utf8');
    
    console.log('Executing SQL script...');
    // Run the entire SQL file. If the script contains DDL that conflicts
    // with an existing database, this may throw. This script is expected
    // to create the `FoodTruck` schema and required tables.
    await db.raw(sqlScript);
    
    console.log('✓ Database initialized successfully!');
    process.exit(0);
  } catch (err) {
    console.error('✗ Error initializing database:', err.message);
    process.exit(1);
  } finally {
    await db.destroy();
  }
}

initializeDatabase();
