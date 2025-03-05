const BookMyBaratBooking = require("../models/BookMyBaratBookingModel");
const catchAsync = require("../utils/catchAsync");

exports.addBookMyBaratBooking = catchAsync(async (req, res) => {
  const {
    customerName,
    phone,
    package,
    email,
    eventDate,
    startTime,
    duration,
    numberOfGuests,
    pickupLocation,
    destinationLocation,
  } = req.body;
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
    destinationLocation,
  });
  res.status(201).json({
    status: "success",
    data: {
      booking: newBooking,
    },
  });
});

exports.getAllBookMyBaratBooking = catchAsync(async (req, res) => {
  const bookings = await BookMyBaratBooking.find();

  res.status(200).json({
    status: "success",
    results: bookings.length,
    data: {
      bookings,
    },
  });
});

exports.updateBooking = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!["pending", "completed"].includes(status)) {
    return res.status(400).json({
      status: "fail",
      message: 'Invalid status. Allowed values are "pending" or "completed".',
    });
  }

  const updatedBooking = await BookMyBaratBooking.findByIdAndUpdate(
    id,
    { status },
    { new: true, runValidators: true }
  );

  if (!updatedBooking) {
    return res.status(404).json({
      status: "fail",
      message: "Booking not found",
    });
  }

  res.status(200).json({
    status: "success",
    data:{
        booking: updatedBooking
    }
  })
});
