const express = require('express');
const app = express();
app.use(express.json());

// PRIVATE API ROUTER
const privateApi = require('./routes/private/api');
app.use('/api/v1', privateApi);

module.exports = app;
