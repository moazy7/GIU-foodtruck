// src/routes/public/auth.js
const express = require('express');
const router = express.Router();

const {
  showRegisterForm,
  registerUser,
  loginUser,
} = require('../../controllers/authController');

// Registration form + submit
router.get('/register', showRegisterForm);
router.post('/register', registerUser);

// Login from ThunderClient (they said GET, but we'll support both)
router.get('/api/v1/user/login', loginUser);
router.post('/api/v1/user/login', loginUser);

module.exports = router;
