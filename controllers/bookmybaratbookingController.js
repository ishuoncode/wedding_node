const BookMyBaratBooking = require("../models/BookMyBaratBookingModel");
const catchAsync = require("../utils/catchAsync");

exports.addBookMyBaratBooking = catchAsync(async(req,res)=>{
    const {customerName,phone,package,email,eventDate,startTime,duration,numberOfGuests,pickupLocation,destinationLocation} = req.body;
    const newBooking = await BookMyBaratBooking.create({
        customerName,
        phone,
        email,
        package,
        eventDate,
        startTime,
        duration,
        numberOfGuests,
        pickupLocation,
        destinationLocation
    });
    res.status(201).json({
        status: "success",
        data: {
            booking: newBooking
        }
    });
})

exports.getAllBookMyBaratBooking = catchAsync(async (req, res) => {
    const bookings = await BookMyBaratBooking.find();

    res.status(200).json({
        status: "success",
        results: bookings.length,
        data: {
            bookings
        }
    });
});