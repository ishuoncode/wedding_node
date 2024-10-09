const express = require("express");
const authController = require("../controllers/authController.js");
const catererController = require("../controllers/catererController.js");
const utilsController = require("../controllers/utilsController.js");
const { uploadImages } = require("../controllers/multerController.js");

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
  .patch(
    authController.protect,
    authController.restrictTo("admin", "seller"),
    catererController.patchCaterer
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
