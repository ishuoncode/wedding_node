const express = require("express");
const authController = require("../controllers/authController.js");
const userController = require("../controllers/userController.js");
const utilsController = require("../controllers/utilsController.js");

const router = express.Router();

router.post("/login", authController.login);
router.post("/signup", authController.signup);
router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);
router.get("/verify", authController.isLoggedIn);
router.post("/uploadPhoto", userController.presigned);
router.post("/uploadDocs", userController.presignedDocs);
router.get("/globalsearch", utilsController.getGlobalSearch);

router.get(
  "/analytics",
  authController.protect,
  authController.restrictTo("admin"),
  userController.getAnalytics
);
router.patch(
  "/updateMyPassword",
  authController.protect,
  authController.restrictTo("seller", "user"),
  authController.updatePassword
);
router.get(
  "/sellerpost",
  authController.protect,
  authController.restrictTo("admin", "seller"),
  userController.sellerpost
);
router
  .route("/addwishlist")
  .patch(authController.protect, utilsController.addWishlist);
router
  .route("/removewishlist")
  .patch(authController.protect, utilsController.removeWishlist);
router.get("/wishlist", authController.protect, userController.getWishlist);

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

router
  .route("/userreview/:id")
  .post(authController.protect, utilsController.userReview)
  .delete(authController.protect, utilsController.deleteReview);

router
  .route("/reviews/:category/:id")
  .get(authController.protect, utilsController.getMoreReviews);

router
  .route("/visit/:category/:id")
  .patch(utilsController.updateVisit)
  .get(utilsController.getVisitData);

module.exports = router;
