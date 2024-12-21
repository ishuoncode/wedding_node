const express = require("express");
const authController = require("../controllers/authController.js");
const adminController = require("../controllers/adminController.js");

const router = express.Router();

router
  .route("/ownership/transfer")
  .put(
    authController.protect,
    authController.restrictTo("admin"),
    adminController.transferOwnership
  );

module.exports = router;
