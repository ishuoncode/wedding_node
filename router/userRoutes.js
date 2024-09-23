const express = require("express");
const authController = require("../controllers/authController.js");
const userController = require("../controllers/userController.js");

const router = express.Router();

router.post("/login", authController.login);
router.post("/signup", authController.signup);
router.get("/verify", authController.isLoggedIn);
router.post("/uploadPhoto", userController.presigned);
router.post("/uploadDocs", userController.presignedDocs);


router.patch(
  "/image/:id",
  authController.protect,
  userController.addProfileImage
);

router
  .route("/")
  .get(
    authController.protect,
    authController.restrictTo("admin"),
    userController.getAllUsers
  );

router
  .route("/:id")
  .get(
    authController.protect,
    authController.restrictTo("admin"),
    userController.getMe
  )
  .delete(
    authController.protect,
    authController.restrictTo("admin"),
    userController.deleteUser
  )
  .patch(authController.protect, userController.updateUser);

router
  .route("/:id/sellerdraft")
  .patch(authController.protect, userController.sellerDraft);

router
  .route("/:id/sellerdraft/documentupdate")
  .patch(authController.protect, userController.documentUpdate);

  router
  .route("/:id/sellerRequest")
  .get(authController.protect, userController.sellerRequest);



module.exports = router;
