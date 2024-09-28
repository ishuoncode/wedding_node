const express = require("express");
const authController = require("../controllers/authController.js");
const banquetController = require("../controllers/banquetController.js");
const { uploadImages } = require("../controllers/multerController.js");

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

// router
//   .route("/:id/gallery")
//   .patch(
//     authController.protect,
//     authController.restrictTo("admin", "seller"),
//     uploadImages,
//     banquetController.patchGallery
//   );

router
  .route("/:id/newfolder")
  .patch(
    authController.protect,
    authController.restrictTo("admin", "seller"),
    uploadImages('photos[]'),
    banquetController.addNewFolder
  );

  router
  .route("/:id/folder/:folderid")
  .patch(
    authController.protect,
    authController.restrictTo("admin", "seller"),
    uploadImages('addImagesArray[]'),
    banquetController.patchFolder
  );

module.exports = router;
