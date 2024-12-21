const express = require("express");
const authController = require("../controllers/authController.js");
const sellerController = require("../controllers/sellerController.js");
const utilsController = require("../controllers/utilsController.js");

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


router
  .route("/billboard/:id")
  .patch(authController.protect, authController.restrictTo("admin","seller"),utilsController.billboard)

module.exports = router;
