const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const protectRoute = require('../middleware/auth.middleware');

router.post('/register', authController.register);

router.post('/login', authController.login);

router.post('/change-password', protectRoute, authController.changePassword);

router.get('/profile', protectRoute, authController.getProfile)

module.exports = router;