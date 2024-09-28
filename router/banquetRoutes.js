const express = require("express");
const authController = require("../controllers/authController.js");
const banquetController = require("../controllers/banquetController.js");

const router = express.Router();

router
  .route("/")
  .get(banquetController.getAllBanquet)
  .post(
    authController.protect,
    authController.restrictTo("admin", "seller"),
    banquetController.createBanquet
  );

router
  .route("/:id")
  .get(banquetController.getBanquet)
  .delete(
    authController.protect,
    authController.restrictTo("admin"),
    banquetController.deleteBanquet
  );

module.exports = router;
