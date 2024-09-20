const express = require('express');
const authController = require('../controllers/authController.js');
const catererController = require('../controllers/catererController.js');


const router = express.Router();

router
  .route('/')
  .get(
    authController.protect,
    catererController.getAllCaterer,
  )

module.exports = router;