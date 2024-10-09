const express = require("express");
const authController = require("../controllers/authController.js");
const photographerController = require("../controllers/photographerController.js");
const utilsController = require("../controllers/utilsController.js");
const { uploadImages } = require("../controllers/multerController.js");

const router = express.Router();

router
  .route("/")
  .get(photographerController.getAllPhotographer)
  .post(
    authController.protect,
    authController.restrictTo("admin", "seller"),
    photographerController.createPhotographer
  );

router
  .route("/:id")
  .get(photographerController.getPhotographer)
  .patch(
    authController.protect,
    authController.restrictTo("admin", "seller"),
    photographerController.patchPhotographer
  );

router
  .route("/:id/:category")
  .delete(
    authController.protect,
    authController.restrictTo("admin", "seller"),
    utilsController.deleteEntity
  );

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
