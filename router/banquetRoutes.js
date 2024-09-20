const express = require('express');
const authController = require('../controllers/authController.js');
const banquetController = require('../controllers/banquetController.js');


const router = express.Router();

router
  .route('/')
  .get(
    authController.protect,
    banquetController.getAllBanquet,
  )


module.exports = router;