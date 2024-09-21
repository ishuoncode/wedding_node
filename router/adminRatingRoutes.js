const express = require('express');
const authController = require('../controllers/authController.js');
const adminRatingController = require("../controllers/adminRatingController.js");


const router = express.Router();

router
  .route("/:id")
  .patch(authController.protect,authController.restrictTo('admin'), adminRatingController.getAdminRating)
 
module.exports = router;