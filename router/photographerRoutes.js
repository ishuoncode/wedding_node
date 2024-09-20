const express = require('express');
const authController = require('../controllers/authController.js');
const photographerController = require('../controllers/photographerController.js');


const router = express.Router();

router
  .route('/')
  .get(
    authController.protect,
    photographerController.getAllPhotographer,
  )

module.exports = router;