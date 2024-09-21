const express = require("express");
const authController = require("../controllers/authController.js");
const decoratorController = require("../controllers/decorController.js");

const router = express.Router();

router
  .route("/")
  .get(decoratorController.getAllDecorator);

router
  .route("/:id")
  .get( decoratorController.getDecorator)
  .delete(
    authController.protect,
    authController.restrictTo("admin"),
    decoratorController.deleteDecorator
  );
module.exports = router;
