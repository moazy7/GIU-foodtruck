require('dotenv').config();
const fs = require('fs');
const path = require('path');
const knex = require('knex');

// Create connection to postgres database (not foodtruck yet)
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
