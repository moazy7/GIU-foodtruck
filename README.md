# GIU Food Truck Backend

Express + Knex + PostgreSQL backend for the GIU Food Truck application.

Quick start

1. Install dependencies:

   npm install

2. Configure database connection in `.env` (example keys):

   DB_HOST=localhost
   DB_USER=postgres
   DB_PASSWORD=yourpassword
   DB_DATABASE=foodtruck
   DB_PORT=5432

3. Initialize the database schema (runs `connectors/script.sql`):

   npm run init-db

4. Start the server (development):

   npm run dev

Available npm scripts

- `npm run init-db` — run DB initialization script
- `npm run dev` — start server with `nodemon`
- `npm run start` — start server with `node`
- `npm run test-smoke` — run a small smoke test (server must be running)

RESTful API endpoints

Base path: `/api/v1`

- Menu items
  - `POST /api/v1/menuItem` — create menu item (body: `name, price, description, category, truckId`)
  - `GET  /api/v1/menuItem?truckId=1` — list items for a truck
  - `GET  /api/v1/menuItem/:itemId` — get item by id
  - `PUT  /api/v1/menuItem/:itemId` — update item
  - `DELETE /api/v1/menuItem/:itemId` — delete item
  - `GET /api/v1/menuItem/truck/:truckId` — list items for a truck (alternate)
  - `GET /api/v1/menuItem/truck/:truckId/category/:category` — list items by category

- Cart
  - `POST /api/v1/cart` — add item to cart (body: `userId, menuItemId, quantity`)
  - `GET  /api/v1/cart/user/:userId` — list cart items for user
  - `DELETE /api/v1/cart/:cartId` — remove cart item

- Trucks
  - `GET /api/v1/trucks` — list trucks
  - `GET /api/v1/trucks/:truckId` — get truck by id

- Orders
  - `POST /api/v1/orders/create` — create order from user's cart (body: `userId`)
  - `GET  /api/v1/orders/user/:userId` — list orders for user
  - `GET  /api/v1/orders/:orderId` — get order details
  - `PUT  /api/v1/orders/:orderId/status` — update order status (body: `status`)

Examples (PowerShell)

Create menu item:
```powershell
$body = @{ name='Taco'; price=5.99; description='Tasty'; category='Main'; truckId=1 } | ConvertTo-Json
Invoke-RestMethod -Method Post -Uri http://localhost:3000/api/v1/menuItem -Body $body -ContentType 'application/json'
```

Add to cart:
```powershell
$body = @{ userId=1; menuItemId=8; quantity=1 } | ConvertTo-Json
Invoke-RestMethod -Method Post -Uri http://localhost:3000/api/v1/cart -Body $body -ContentType 'application/json'
```

Create order:
```powershell
Invoke-RestMethod -Method Post -Uri http://localhost:3000/api/v1/orders/create -Body (@{ userId=1 } | ConvertTo-Json) -ContentType 'application/json'
```

---
Validation helpers are in `src/middleware/validate.js`.
The DB initializer is `connectors/init-db.js` (executes `connectors/script.sql`).

