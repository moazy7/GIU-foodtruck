// src/app.js
const express = require('express');
const app = express();

// parse JSON (for ThunderClient)
app.use(express.json());

// parse form data from /register HTML form
app.use(express.urlencoded({ extended: true }));

// PUBLIC AUTH ROUTES (register + login)
const authRoutes = require('./routes/public/auth');
app.use('/', authRoutes);

// PRIVATE API ROUTER (milestone endpoints)
const privateApi = require('./routes/private/api');
app.use('/api/v1', privateApi);

module.exports = app;
