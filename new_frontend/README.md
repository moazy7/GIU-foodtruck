Simple plain-HTML frontend for GIU-foodtruck backend

Quick start

- Serve these files from the same origin as the backend (so cookies work). Example (from project root):

Option A — serve standalone (different port):

```bash
npx http-server -c-1 -p 3000 new_frontend/
# then open http://localhost:3000/
```

Option B — serve from the backend (recommended for testing with cookies):

```bash
# copy the built frontend into the backend's public/ui folder
node scripts/deploy_frontend.js
# start the backend (it serves the files under /ui/)
npm run server
# then open http://localhost:3001/ui/index.html
```

Pages
- index.html — list trucks
- login.html — user login
- register.html — user registration
- menu.html — truck menu and add-to-cart
- cart.html — view cart and place order
- owner_dashboard.html — owner landing
- owner_menu.html — owner CRUD for menu items
- owner_orders.html — owner view/update orders

Notes
- All API calls use fetch to `/api/v1/...` and include credentials (`credentials: 'include'`). Ensure backend server is reachable at the same host/port or adapt `baseUrl` in `js/api.js`.
