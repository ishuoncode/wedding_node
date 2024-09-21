const express = require("express");
const authController = require("../controllers/authController.js");
const photographerController = require("../controllers/photographerController.js");

const router = express.Router();

router
  .route("/")
  .get( photographerController.getAllPhotographer);

router
  .route("/:id")
  .get( photographerController.getPhotographer)
  .delete(
    authController.protect,
    authController.restrictTo("admin"),
    photographerController.deletePhotographer
  );

module.exports = router;
