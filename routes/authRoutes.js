const express = require('express');
const router = express.Router();
const { register, login, getAllUsers } = require('../controllers/authController');
const { authMiddleware, adminCheck } = require('../middleware/authMiddleware');

// Auth routes
router.post('/register', register);
router.post('/login', login);
router.get('/users', authMiddleware, adminCheck, getAllUsers);

module.exports = router;