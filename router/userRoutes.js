const express = require("express");
const authController = require("../controllers/authController.js");
const userController = require("../controllers/userController.js");

const router = express.Router();

router.post("/login", authController.login);
router.post("/signup", authController.signup);
router.get("/verify",authController.isLoggedIn)
router.post("/uploadPhoto",userController.presigned)
router.patch("/image/:id",authController.protect,userController.addProfileImage)

router
  .route("/")
  .get(
    authController.protect,
    authController.restrictTo("admin"),
    userController.getAllUsers
  );

router
  .route("/:id")
  .get(authController.protect,authController.restrictTo('admin'), userController.getMe)
  .delete(
    authController.protect,
    authController.restrictTo("admin"),
    userController.deleteUser
  );

module.exports = router;
