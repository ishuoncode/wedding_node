const express = require("express");
const authController = require("../controllers/authController.js");
const catererController = require("../controllers/catererController.js");

const router = express.Router();

router
  .route("/")
  .get(catererController.getAllCaterer)
  .post(
    authController.protect,
    authController.restrictTo("admin", "seller"),
    catererController.createCaterer
  );

router
  .route("/:id")
  .get(catererController.getCaterer)
  .delete(
    authController.protect,
    authController.restrictTo("admin"),
    catererController.deleteCaterer
  );

module.exports = router;
