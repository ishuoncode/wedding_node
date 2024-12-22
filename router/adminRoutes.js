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

  router
  .route("/ownership/transfer/all")
  .patch(
    authController.protect,
    authController.restrictTo("admin"),
    adminController.transferAllOwnership
  );

module.exports = router;
