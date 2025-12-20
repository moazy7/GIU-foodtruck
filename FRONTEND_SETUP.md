Frontend integration notes

What I changed
- Wired existing static pages in `public/ui` to the backend API endpoints using `public/ui/ui.js`.
- Implemented: login, register, trucks listing, menu listing (with category filter), cart (view/add/update/remove/place), customer orders list, owner menu management, owner orders list, and add/edit menu items.
- Updated `public/ui/orders.html` and `public/ui/owner_orders.html` to include containers used by the JS.

How to run
1. Install dependencies and start the server (PowerShell):

```powershell
npm install
npm run server
```

2. Open the UI in your browser:
- `http://localhost:3001/ui/login.html` — Login
- `http://localhost:3001/ui/register.html` — Register
- `http://localhost:3001/ui/trucks.html` — Browse trucks

Backend and DB prerequisites
- The backend expects a PostgreSQL database and environment variables in a `.env` file: `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_DATABASE`, `DB_PORT`.
- Create the DB and load schema/data using `connectors/scripts.sql` and `connectors/seed.sql` if needed.
- The app uses cookie-based sessions. Login sets a `session_token` cookie; protected APIs require this cookie and `fetch` calls include `credentials: 'include'`.

Notes / assumptions
- I could not fully run end-to-end tests because a live database and session data are required. If you provide DB access or a test SQLite/Postgres URL, I can run the server and exercise flows.
- `ui.js` now supports editing menu items via `PUT /api/v1/menuItem/edit/:itemId` and creating via `POST /api/v1/menuItem/new`.

Next steps (optional)
- Provide database connection info or a disposable test database so I can run the server and verify flows.
- Improve UI/UX and show order details (items per order) in the orders views.
- Add client-side form validation and nicer error display.
