const express = require("express");
const baratController = require("../controllers/bookmybaratpackageController");
const authController = require("../controllers/authController");

const router = express.Router();

// Routes for managing packages
router
  .route("/")
  .post(authController.protect, authController.restrictTo("admin"), baratController.createPackage)
  .get(baratController.getAllPackages);

router
  .route("/:id")
  .get(baratController.getPackageById) // Get a single package by ID
  .patch(authController.protect,authController.restrictTo("admin"), baratController.updatePackage) 
  .delete(authController.protect,authController.restrictTo("admin"), baratController.deletePackage);

module.exports = router;
