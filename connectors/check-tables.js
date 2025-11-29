require('dotenv').config();
const db = require('./db/knexfile');

(async function(){
  try {
    console.log('Checking for schema and tables...');
    const exists = await db.raw('select to_regclass(\'"FoodTruck"."MenuItems"\')');
    console.log('to_regclass result:', exists.rows || exists);

    const tables = await db('information_schema.tables')
      .select('table_schema','table_name')
      .where('table_schema','FoodTruck');

    console.log('Tables in schema FoodTruck:', tables);
  } catch (err) {
    console.error('Error checking tables:', err.message);
  } finally {
    await db.destroy();
  }
})();
