const express = require("express");
const authController = require("../controllers/authController.js");
const decoratorController = require("../controllers/decorController.js");
const utilsController = require("../controllers/utilsController.js");
const { uploadImages } = require("../controllers/multerController.js");

const router = express.Router();

router
  .route("/")
  .get(decoratorController.getAllDecorator)
  .post(
    authController.protect,
    authController.restrictTo("admin", "seller"),
    decoratorController.createDecorator
  );

router
  .route("/:id")
  .get(decoratorController.getDecorator)
  .delete(
    authController.protect,
    authController.restrictTo("admin"),
    decoratorController.deleteDecorator
  );


  router
  .route("/:id/newfolder")
  .patch(
    authController.protect,
    authController.restrictTo("admin", "seller"),
    uploadImages('photos[]'),
    utilsController.addNewFolder
  );

  router
  .route("/:id/folder/:folderid")
  .patch(
    authController.protect,
    authController.restrictTo("admin", "seller"),
    uploadImages('addImagesArray[]'),
    utilsController.patchFolder
  );

module.exports = router;
