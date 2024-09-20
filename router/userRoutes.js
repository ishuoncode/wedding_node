const express = require('express');
const authController = require('../controllers/authController.js');
const userController = require('../controllers/userController.js');


const router = express.Router();

router.post('/login', authController.login);
router.post('/signup', authController.signup);

router
  .route('/')
  .get(
    authController.protect,
    authController.restrictTo('admin'),
    userController.getAllUsers,
  )

module.exports = router;