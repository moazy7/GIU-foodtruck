# GIU FoodTruck – Full Stack Web Application

This project is a full-stack Food Truck ordering system developed as part of the GIU coursework.  
It includes authentication, customer ordering, cart management, and a truck owner dashboard.

---

## 🔧 Tech Stack
- **Backend:** Node.js, Express
- **Frontend:** HJS (server-rendered views), jQuery
- **Styling:** Bootstrap + custom CSS
- **Auth:** JWT + cookies
- **Database:** (as provided in backend template)

---

## 🚀 Installation & Setup

### 1️⃣ Install dependencies
```bash
npm install

2️⃣ Environment variables

Create a .env file (this file is git-ignored and NOT pushed to GitHub).

Example: 
PORT=3001
JWT_SECRET=your_secret_key

3️⃣ Run the server
npm run server
The app will run at: http://localhost:3001


🔐 Authentication
Pages:
/ or /login → Login page
/register → Register page

Features:
User registration
User login
Role-based redirection:
Customer → Customer dashboard
Truck Owner → Owner dashboard
Show / Hide password toggle (UX improvement)


👤 Customer Features:-
Dashboard:
Navigation bar with:
Trucks
Cart
My Orders
Logout

Trucks Page (/trucks):
Displays available food trucks
Shows Open / Closed status
View Menu button (disabled if closed)
UI styled to closely match the provided PDF

Menu Page (/truckMenu/:truckId):
Menu items listing
Category filter
Add to Cart functionality

Cart Page (/cart):
Displays:
Items
Quantities
Prices
Subtotal
Total

Quantity increase / decrease
Remove item
Empty cart state includes Browse Trucks button (PDF requirement)

My Orders (/myOrders):
Shows order history
Order status (Pending / Preparing / Ready / Completed / Cancelled)
View Details button:
Displays item names
Quantities
Prices
Order total