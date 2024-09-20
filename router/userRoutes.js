const express = require('express');
const authController = require('../controllers/authController.js');


const router = express.Router();

router.post('/login', authController.login);
router.post('/signup', authController.signup);
// router.get('/logout', authController.logout);

// router.get('/authenticated', authController.isLoggedIn);

// router.post('/forgotPassword', authController.forgotPassword);

// router.patch('/resetPassword/:token', authController.resetPassword);

module.exports = router;