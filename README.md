# Food Truck Ordering System - Backend (Milestone 3)

This backend application is built using Node.js, Express, and PostgreSQL. It supports two roles: Customer and Truck Owner. Features include authentication, session handling, menu management, cart operations, and order processing.

---------------------------------------------------------
INSTALLATION
---------------------------------------------------------

1. Install dependencies:
   npm install

2. Create a .env file in the root folder (not included in submission):

   DB_USER=postgres
   DB_PASSWORD=yourPassword
   DB_DATABASE=foodtruck
   DB_HOST=localhost
   DB_PORT=5432
   SESSION_SECRET=anySecretKey

3. Start the server:
   node server.js

Server runs on:
http://localhost:3001

---------------------------------------------------------
DATABASE SETUP
---------------------------------------------------------

Inside /connectors/script.sql you will find:

- CREATE DATABASE foodtruck
- CREATE SCHEMA "FoodTruck"
- CREATE TABLES for:
  Users
  Trucks
  MenuItems
  Carts
  Orders
  OrderItems
  Sessions

Run script.sql in pgAdmin before starting the server.

---------------------------------------------------------
USER ROLES
---------------------------------------------------------

CUSTOMER:
- View trucks
- View menu items
- Filter menu by category
- Add items to cart
- Edit cart quantities
- Remove items from cart
- Place orders
- View my orders

TRUCK OWNER:
- Add menu items
- Edit menu items
- Delete menu items
- View orders placed to their truck
- Update order status (pending, preparing, ready, completed, cancelled)

---------------------------------------------------------
PUBLIC ROUTES
---------------------------------------------------------

POST /register
POST /login
GET  /logout

---------------------------------------------------------
CUSTOMER ROUTES
---------------------------------------------------------

GET    /api/v1/trucks/view
GET    /api/v1/menuItem/truck/:truckId
GET    /api/v1/menuItem/truck/:truckId/category/:category

POST   /api/v1/cart/new
GET    /api/v1/cart/view
PUT    /api/v1/cart/edit/:cartId
DELETE /api/v1/cart/delete/:cartId

POST   /api/v1/order/new
GET    /api/v1/order/myOrders
GET    /api/v1/order/details/:orderId

---------------------------------------------------------
TRUCK OWNER ROUTES
---------------------------------------------------------

GET    /api/v1/trucks/myTruck
PUT    /api/v1/trucks/updateOrderStatus

POST   /api/v1/menuItem/new
GET    /api/v1/menuItem/view
PUT    /api/v1/menuItem/edit/:itemId
DELETE /api/v1/menuItem/delete/:itemId

GET    /api/v1/order/truckOrders
GET    /api/v1/order/truckOwner/:orderId
PUT    /api/v1/order/updateStatus/:orderId

---------------------------------------------------------
PROJECT STRUCTURE
---------------------------------------------------------

milestoneBackend/
  connectors/
    db.js
    script.sql
  middleware/
    auth.js
  public/
  routes/
    public/
      api.js
      view.js
    private/
      api.js
      view.js
  utils/
    session.js
  views/
  server.js
  package.json
  package-lock.json

---------------------------------------------------------
NOTES
---------------------------------------------------------

- .env file must be created locally.
- All endpoints follow the milestone 3 specification.

---------------------------------------------------------
FRONTEND (Static UI)
---------------------------------------------------------

A static frontend UI that mirrors the provided design screenshots is available under `public/ui`.

Quick start (after dependencies are installed and the server is running):

1. Start the backend server (from repo root):

```bash
npm install
node server.js
```

2. Open these pages in your browser:
- Landing / Login: [public/ui/login.html](public/ui/login.html)
- Register: [public/ui/register.html](public/ui/register.html)
- Customer dashboard: [public/ui/customer.html](public/ui/customer.html)
- Browse trucks: [public/ui/trucks.html](public/ui/trucks.html)
- Truck menu: [public/ui/menu.html](public/ui/menu.html) (append `?truck=<truckId>` to view a truck's menu)
- Cart: [public/ui/cart.html](public/ui/cart.html)
- My orders: [public/ui/orders.html](public/ui/orders.html)

3. Notes on integration:
- The static UI uses the existing backend API endpoints: `POST /api/v1/user` (register) and `POST /api/v1/user/login` (login).
- `public/ui/ui.js` attempts to call:
  - `GET /api/v1/trucks/view` to list trucks
  - `GET /api/v1/menuItem/truck/:truckId` to fetch menu items
  - `POST /api/v1/cart/new` to add items to the cart
- The app sets `credentials: 'include'` for requests that expect cookies/sessions.

If you want I can:
- Update the UI styling further to match screenshots exactly.
- Implement additional client-side flows (owner CRUD, order placement).
- Add automated smoke tests for the static pages.

