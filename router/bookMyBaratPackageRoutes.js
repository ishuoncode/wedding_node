const express = require("express");
const packageController = require("../controllers/bookmybaratPackageController");
const authController = require("../controllers/authController");

const router = express.Router();

// Routes for managing packages
router
  .route("/")
  .post(authController.protect, authController.restrictTo("admin"), packageController.createPackage)
  .get(packageController.getAllPackages);

router
  .route("/:id")
  .get(packageController.getPackageById) // Get a single package by ID
  .patch(authController.protect,authController.restrictTo("admin"), packageController.updatePackage) 
  .delete(authController.protect,authController.restrictTo("admin"), packageController.deletePackage);

module.exports = router;
