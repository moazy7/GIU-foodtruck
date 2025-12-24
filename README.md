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