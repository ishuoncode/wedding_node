const express = require("express");
const authController = require("../controllers/authController.js");
const banquetController = require("../controllers/banquetController.js");
const utilsController = require("../controllers/utilsController.js");
const { uploadImages } = require("../controllers/multerController.js");

const router = express.Router();

router.patch(
  "/:id/locationurl",
  authController.protect,
  authController.restrictTo("admin", "seller"),
  banquetController.locationUrl
);
router.get(
  "/near/:distance/:latlng",
  authController.protect,
  banquetController.getBanquetsWithinRange
);

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
  .patch(
    authController.protect,
    authController.restrictTo("admin", "seller"),
    banquetController.patchBanquet
  );

router
  .route("/:id/:category")
  .delete(
    authController.protect,
    authController.restrictTo("admin", "seller"),
    utilsController.deleteEntity
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
    uploadImages("photos[]"),
    utilsController.addNewFolder
  );

router
  .route("/:id/folder/:folderid")
  .patch(
    authController.protect,
    authController.restrictTo("admin", "seller"),
    uploadImages("addImagesArray[]"),
    utilsController.patchFolder
  );

module.exports = router;
