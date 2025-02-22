const express = require("express");
const baratController = require("../controllers/bookmybaratpackageController");
const authController = require("../controllers/authController");
const { uploadImages } = require("../controllers/multerController");

const router = express.Router();

// Routes for managing packages
router
  .route("/")
  .post(
    authController.protect,
    authController.restrictTo("admin"),
    baratController.createPackage
  )
  .get(baratController.getAllPackages);

router
  .route("/gallery/:id")
  .post(
    authController.protect,
    authController.restrictTo("admin"),
    uploadImages("gallery[]"),
    baratController.addImages
  )
  .patch(
    authController.protect,
    authController.restrictTo("admin"),
    baratController.deleteImages
  );

router
  .route("/video/:id")
  .post(
    authController.protect,
    authController.restrictTo("admin"),
    baratController.addVideos
  )
  .patch(
    authController.protect,
    authController.restrictTo("admin"),
    baratController.deleteVideos
  );

router
  .route("/visibleImages/:id")
  .post(
    authController.protect,
    authController.restrictTo("admin"),
    baratController.visibleImages
  );

  router
  .route("/visibleVideos/:id")
  .post(
    authController.protect,
    authController.restrictTo("admin"),
    baratController.visibleVideos
  );

router
  .route("/:id")
  .get(baratController.getPackageById) // Get a single package by ID
  .patch(
    authController.protect,
    authController.restrictTo("admin"),
    baratController.updatePackage
  )
  .delete(
    authController.protect,
    authController.restrictTo("admin"),
    baratController.deletePackage
  );

module.exports = router;
