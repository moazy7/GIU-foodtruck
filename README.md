# GIU Food Truck Management System

Project to manage food trucks, menus and orders for customers and truck owners.

**Team members:** (moaz yasser, 16005876, T16 - mohamed nabil, 16002798, T12 - Fady rafik, 16001181, T11 - Kareem Diaa, 16002995, T2 - Omar khaled elsakka, 16005193, Tut 8 - Omar khaled Elbanna, 16003283, T6 - May Badran, 16007750, T12 - Ahmed Tarek, 16002402, Tut 8)

## Features
- **Customers:** view trucks, browse truck menus by category, add items to cart, edit cart, place orders, view order history and order details, register and login.
- **Truck owners:** create / edit / soft-delete menu items, view and manage their truck, update truck availability and order status, view and update incoming orders for their truck.

## Technology Stack
- **Frontend:** HTML templates with `hjs`, Bootstrap 3/4 styles, jQuery.
- **Backend:** Node.js, Express, Knex.js (query builder).
- **Database:** PostgreSQL (schema lives in `connectors/scripts.sql`).
- **Other:** `dotenv` for configuration, `uuid` for sessions, `nodemon` for development.

## ERD & Suggested Tables
Schema name used: `FoodTruck`.

Suggested tables (also implemented in `connectors/scripts.sql`):
- **Users**: `userId (PK)`, `name`, `email (unique)`, `password`, `role` (customer|truckOwner), `birthDate`, `createdAt`.
- **Trucks**: `truckId (PK)`, `truckName`, `truckLogo`, `ownerId (FK -> Users.userId)`, `truckStatus`, `orderStatus`, `createdAt`.
- **MenuItems**: `itemId (PK)`, `truckId (FK -> Trucks.truckId)`, `name`, `description`, `price`, `category`, `status`, `createdAt`.
- **Orders**: `orderId (PK)`, `userId (FK -> Users.userId)`, `truckId (FK -> Trucks.truckId)`, `orderStatus`, `totalPrice`, `scheduledPickupTime`, `estimatedEarliestPickup`, `createdAt`.
- **OrderItems**: `orderItemId (PK)`, `orderId (FK -> Orders.orderId)`, `itemId (FK -> MenuItems.itemId)`, `quantity`, `price`.
- **Carts**: `cartId (PK)`, `userId (FK -> Users.userId)`, `itemId (FK -> MenuItems.itemId)`, `quantity`, `price`.
- **Sessions**: `id (PK)`, `userId (FK -> Users.userId)`, `token`, `expiresAt`.

ERD Notes: Orders relate customers to a truck and have many OrderItems. Carts are per-customer and constrained to a single truck at a time by application logic.

## Installation & Setup
1. Clone the repo:

   git clone <repo-url>
   cd GIU-foodtruck-1

2. Install dependencies:

   npm install

3. Create a `.env` file in the project root with the following variables (example):

   DB_HOST=localhost
   DB_USER=postgres
   DB_PASSWORD=your_db_password
   DB_DATABASE=foodtruck
   DB_PORT=5432
   DB_POOL_MAX=10

4. Create the database and schema in PostgreSQL (using `psql` or pgAdmin). You can run the provided schema script to create the `FoodTruck` schema and tables:

   -- using psql
   psql -U postgres -d postgres -f connectors/scripts.sql

5. (Optional) Load sample data for testing:

   psql -U postgres -d postgres -f connectors/seed.sql

   Note: the sample `seed.sql` contains hashed passwords. For quick local testing you can insert a plain-text test user (the login endpoint expects the stored password to match the submitted password):

   INSERT INTO "FoodTruck"."Users" (name, email, password, role) VALUES ('Test User','test@example.com','password123','customer');

6. Start the server (development):

   npm run server

7. Open the app in your browser at `http://localhost:3000` (or the port set in `server.js`).

## Test Credentials
- Sample seeded users (from `connectors/seed.sql`):
  - ahmed@example.com (password: see `seed.sql` — passwords may be hashed)
  - sara@example.com (truck owner)

- Recommended quick test account (create with the SQL above or via the register page):
  - Email: `test@example.com`
  - Password: `password123`

## Screenshots
Place screenshots in `public/images/screenshots/` and name them to match pages. A detailed guide is available in `public/images/screenshots/SCREENSHOTS_GUIDE.md`.

Recommended list of pages to capture:
- **Customer Pages:** `customerHomepage`, `trucks`, `truckMenu`, `menuItems`, `cart`, `myOrders`, `orderDetails`.
- **Truck Owner Pages:** `ownerDashboard`, `truckOwnerHomePage`, `truckOrders`, `addMenuItem`, `truckMenu` (owner view), `menuItemEdit`.
- **Auth Pages:** `register`, `login`.

Example markdown to add an image here (replace filename):

```markdown
![Customer Homepage](public/images/screenshots/customerHomepage.png)
```

After adding screenshots, update this section with the images using the markdown syntax above.

## API Endpoints Summary
Below is a concise list of the main API endpoints implemented (see `routes/public/api.js` and `routes/private/api.js`):

- `POST /api/v1/user` — Register new user (public).
- `POST /api/v1/user/login` — Login, creates a session cookie (public).
- `GET /test` — Simple health/test endpoint (private routes file).

- Trucks:
  - `GET /api/v1/trucks/view` — List available trucks (customer).
  - `GET /api/v1/trucks/myTruck` — Get truck for logged-in owner.
  - `PUT /api/v1/trucks/updateOrderStatus` — Update truck `orderStatus` (owner).

- Menu Items:
  - `POST /api/v1/menuItem/new` — Create menu item (owner).
  - `GET /api/v1/menuItem/view` — View owner menu items (owner).
  - `GET /api/v1/menuItem/view/:itemId` — View specific item (owner).
  - `PUT /api/v1/menuItem/edit/:itemId` — Edit item (owner).
  - `DELETE /api/v1/menuItem/delete/:itemId` — Soft-delete (owner).
  - `GET /api/v1/menuItem/truck/:truckId` — Customer: view menu for a truck.
  - `GET /api/v1/menuItem/truck/:truckId/category/:category` — Filter by category (customer).

- Cart & Orders:
  - `POST /api/v1/cart/new` — Add/update item in cart (customer).
  - `PUT /api/v1/cart/update` or `PUT /api/v1/cart/edit/:cartId` — Update cart quantity.
  - `DELETE /api/v1/cart/delete/:cartId` — Remove cart item.
  - `GET /api/v1/cart/view` — View cart (customer).
  - `POST /api/v1/cart/place` or `POST /api/v1/order/new` — Place order from cart (customer).
  - `GET /api/v1/order/myOrders` — Customer orders list.
  - `GET /api/v1/order/details/:orderId` — Customer order details.
  - `GET /api/v1/order/truckOrders` — Owner: orders for their truck.
  - `GET /api/v1/order/truckOwner/:orderId` — Owner: order details.
  - `PUT /api/v1/order/updateStatus/:orderId` — Owner: update order status.

For request/response examples, inspect the route handlers in `routes/`.

## Contributors
Roles below are suggested; please update if you prefer different attributions.
- Moaz Yasser — Backend & API design
- Mohamed Nabil — Backend routing and business logic
- Fady Rafik — Database design and SQL scripts
- Kareem Diaa — Frontend pages and templates
- Omar Khaled Elsakka — Backend integration and testing
- Omar Khaled Elbanna — DevOps / deployment scripts
- May Badran — Frontend styling and UX
- Ahmed Tarek — QA and documentation

## Notes & Next Steps
- Add screenshots to `public/images/screenshots/` and commit them to this repo.
- If you want hashed passwords and bcrypt-based login flows, we can update the auth handlers to hash/compare securely.

---
Generated README — update any contributor roles or add screenshots as needed.
# GIU FoodTruck – Full Stack Web Application

This project is a full-stack Food Truck ordering system developed for the GIU coursework.
It supports customer ordering, cart management, and a complete truck owner dashboard
with order and menu management.

---

## Tech Stack
- Backend: Node.js, Express
- Frontend: HJS (server-side views), jQuery
- Styling: Bootstrap + Custom CSS
- Authentication: JWT + Cookies
- Authorization: Role-based access (Customer / Truck Owner)

---

## Installation & Setup

1. Install dependencies:
```bash
npm install
Create a .env file (this file is NOT pushed to GitHub):

env
Copy code
PORT=3001
JWT_SECRET=your_secret_key
Run the server:

bash
Copy code
npm run server
Open the application:

arduino
Copy code
http://localhost:3001
Authentication
Pages
/ or /login → Login

/register → Register

Features
User registration

User login

Show / Hide password toggle

Role-based redirection:

Customer → Customer Dashboard

Truck Owner → Owner Dashboard

Customer Features
Navigation
Trucks

Cart

My Orders

Logout

Trucks Page (/trucks)
Displays available food trucks

Shows Open / Closed status

View Menu button (disabled if truck is closed)

UI styled to match the provided PDF as closely as possible

Menu Page (/truckMenu/:truckId)
Lists menu items for the selected truck

Category filtering

Add to Cart functionality

Cart Page (/cart)
Displays:

Items

Quantities

Prices

Subtotal

Total

Increase / decrease quantity

Remove items

Empty cart state shows a Browse Trucks button (PDF requirement)

My Orders Page (/myOrders)
Displays all customer orders

Order statuses:

Pending

Preparing

Ready

Completed

Cancelled

View Details button:

Shows item names

Quantities

Prices

Order total

Truck Owner Features
Owner Dashboard (/ownerDashboard)
Displays truck information

Order availability toggle (Open / Closed)

Statistics:

Number of menu items

Pending orders

Completed orders today

Recent orders section

Menu Management
/ownerMenuItems

View all menu items

Item status (Available / Unavailable)

Edit and Delete actions

/ownerMenuItems/new

Add a new menu item

Fields:

Name

Category

Description

Price

UI styled to match the PDF

Orders Management (/truckOrders)
Tabs:

All

Pending

Preparing

Ready

Completed

Cancelled

Orders table includes:

Order ID

Customer

Items

Total price

Date

Status

View Details modal:

Shows order items

Quantities

Prices

Order actions:

Set Preparing

Set Ready

Complete Order

Cancel Order

Authorization & Security
Protected routes using authMiddleware

Customers cannot access owner routes

Owners cannot access customer routes

JWT stored securely in cookies

Project Structure
arduino
Copy code
GIU-foodtruck/
│
├── middleware/
│   └── auth.js
│
├── public/
│   ├── src/
│   │   ├── login.js
│   │   ├── register.js
│   │   ├── trucks.js
│   │   ├── cart.js
│   │   ├── myOrders.js
│   │   ├── truckOrders.js
│   │   └── ...
│   │
│   ├── styles/
│   │   ├── bootstrap.min.css
│   │   └── style.css
│   │
│   └── images/
│
├── routes/
│   ├── public/
│   └── private/
│
├── views/
│   ├── login.hjs
│   ├── register.hjs
│   ├── trucks.hjs
│   ├── cart.hjs
│   ├── myOrders.hjs
│   ├── ownerDashboard.hjs
│   ├── ownerMenuItems.hjs
│   ├── addMenuItem.hjs
│   └── truckOrders.hjs
│
├── server.js
├── package.json
└── README.md
Notes
.env is excluded using .gitignore

Frontend communicates with backend using AJAX

Order details are fetched dynamically when needed

UI behavior matches the PDF requirements