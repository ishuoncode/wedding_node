const express = require('express');
const authController = require('../controllers/authController.js');
const decoratorController = require('../controllers/decorController.js');


const router = express.Router();

router
  .route('/')
  .get(
    authController.protect,
    decoratorController.getAllDecorator,
  )

module.exports = router;