const express = require("express");
const authController = require("../controllers/authController.js");
const sellerController = require("../controllers/sellerController.js");

const router = express.Router();

router.patch(
  "/:id/sellerstatus",
  authController.protect,
  authController.restrictTo("admin"),
  sellerController.updateStatus
);

router
  .route("/")
  .get(
    authController.protect,
    authController.restrictTo("admin"),
    sellerController.getAllSellers
  );

router
  .route("/:id")
  .get(
    authController.protect,
    authController.restrictTo("admin"),
    sellerController.getMe
  );
module.exports = router;
