const AppError = require("../utils/appError");
const catchAsync = require("./../utils/catchAsync");
const Appointment = require("../models/appointmentModal");
const User = require("../models/userModal");

exports.addBookAppointment = catchAsync(async (req, res, next) => {
  const { categoryName, categoryId, timeSlot, name, phone, date } = req.body;
  const queryField = `post.${categoryName}`;
  const seller = await User.find({ [queryField]: { $in: categoryId } }).select(
    "_id"
  );
  if (!seller || seller.length === 0) {
    return next(
      new AppError("No sellers found for the given category and ID", 404)
    );
  }

  // Create a new appointment
  const newAppointment = await Appointment.create({
    categoryName,
    categoryId,
    timeSlot,
    name,
    phone,
    date,
    userId: seller[0]._id,
  });

  // Send a response with the created appointment
  res.status(201).json({
    status: "success",
    data: {
      appointment: newAppointment,
    },
  });
});

exports.getAllAppointment = catchAsync(async (req, res, next) => {
  // Determine the status from the query parameters, default to "pending"
  const statusFilter =
    req.query.status === "completed" ? "completed" : "pending";
  const userRole = req.user.role;

  

  console.log(userRole,"userRole")

  let appointments;
  if (userRole === "seller") {
    appointments = await Appointment.find({ status: statusFilter })
      .sort({ date: 1 }) // Sort appointments by date in ascending order (earliest first)
      .populate({
        path: "categoryId",
        select: "name price",
      });
  }
  if (userRole === "admin") {
    // Fetch appointments based on the determined status, sort by date (ascending), and populate the categoryId with the category name
    appointments = await Appointment.find({ status: statusFilter })
      .sort({ date: 1 }) // Sort appointments by date in ascending order (earliest first)
      .populate({
        path: "categoryId",
        select: "name price",
      })
      .populate({
        path: "userId",
        select:
          "draft.personalInfo.firstName draft.personalInfo.middleName draft.personalInfo.lastName draft.personalInfo.phoneNumber",
      });
  }

  // Send the fetched appointments as a response
  res.status(200).json({
    status: "success",
    results: appointments.length,
    data: {
      appointments,
    },
  });
});

exports.updateAppointmentStatus = catchAsync(async (req, res, next) => {
  const { id } = req.params; // Get appointment ID from the request parameters
  const { status } = req.body; // Get new status from the request body

  // Validate the status value
  if (!["pending", "completed"].includes(status)) {
    return res.status(400).json({
      status: "fail",
      message: 'Invalid status. Allowed values are "pending" or "completed".',
    });
  }

  // Update the appointment's status
  const updatedAppointment = await Appointment.findByIdAndUpdate(
    id,
    { status }, // Set the new status
    { new: true, runValidators: true } // Options to return the updated document and run validators
  );

  // Check if the appointment was found and updated
  if (!updatedAppointment) {
    return res.status(404).json({
      status: "fail",
      message: "Appointment not found.",
    });
  }

  // Send the updated appointment as a response
  res.status(200).json({
    status: "success",
    data: {
      appointment: updatedAppointment,
    },
  });
});
