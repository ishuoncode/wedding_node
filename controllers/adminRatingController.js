const Banquet = require('../models/banquetModal');
const Decorator = require('../models/decoratorModal');
const Caterer = require('../models/catererModal');
const Photographer = require('../models/photographerModal');
const AppError = require("../utils/appError");
const catchAsync = require('./../utils/catchAsync');

// Map to store models for dynamic model referencing
const modelsMap = {
  Banquet,
  Caterer,
  Decorator,
  Photographer,
};

// Controller to update admin rating
exports.getAdminRating = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { name } = req.query; // Model name from query parameter
    console.log(id,name)
  // Check if the model name is valid
  if (!name || !modelsMap[name]) {
    return next(new AppError("Invalid model name provided", 400));
  }

  const { adminRating } = req.body;

  // Ensure that adminRating is provided
  if (adminRating === undefined || adminRating === null) {
    return next(new AppError("Admin rating must be provided", 400));
  }

  const Model = modelsMap[name]; // Fetch the model dynamically

  // Build the update query based on adminRating value
  let updateQuery;
  if (adminRating === 1) {
    // Remove the adminRating field if value is 1
    updateQuery = { $unset: { adminRating: "" } };
  } else {
    // Otherwise, update the adminRating field
    updateQuery = { adminRating };
  }

  // Update the document using findByIdAndUpdate
  const updatedDocument = await Model.findByIdAndUpdate(id, updateQuery, {
    new: true, // Return the updated document
  });

  // If the document is not found, throw a 404 error
  if (!updatedDocument) {
    return next(new AppError(`${name} not found`, 404));
  }

  // Send the success response with updated document
  return res.status(200).json({
    success: true,
    message: "Update Success",
    data: updatedDocument,
  });
});
