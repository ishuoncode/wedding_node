const express = require('express');
const  BookingController  = require('../controllers/bookmybaratbookingController');
const authController = require("../controllers/authController");


const router = express.Router();

router
    .route("/")
    .get(
        authController.protect,
        authController.restrictTo("admin"),
        BookingController.getAllBookMyBaratBooking)
    .post(
        BookingController.addBookMyBaratBooking
    );
    

    router.route("/updatebooking/:id").patch(
        authController.protect,
        authController.restrictTo("admin"),
        BookingController.updateBooking
    )


    module.exports = router;