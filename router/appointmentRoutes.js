const express = require("express");
const authController = require("../controllers/authController.js");
const appointmentController = require("../controllers/appointmentController.js");
const utilsController = require("../controllers/utilsController.js");

const router = express.Router();

router
  .route("/bookappointment")
  .post(appointmentController.addBookAppointment)
  .get(
    authController.protect,
    authController.restrictTo("admin", "seller"),
    appointmentController.getAllAppointment
  );

router.route("/updateappointment/:id").patch(
  authController.protect,
  authController.restrictTo("admin"),
  appointmentController.updateAppointmentStatus
);
module.exports = router;
