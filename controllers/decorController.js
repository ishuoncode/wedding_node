const Decorator = require('../models/decoratorModal');
const Analytics = require("../models/analyticsModal");
const catchAsync = require('./../utils/catchAsync');
const { buildFiltersAndSort } = require('./utilsController');
const AppError  = require("../utils/appError");
const User = require('../models/userModal');



exports.getAllDecorator = catchAsync(async (req, res, next) => {
  const { query } = req;
  const { filters, sort } = buildFiltersAndSort(query);

  // Fetch decorator data based on filters and sorting
  const decorators = await Decorator.find(filters).sort(sort).select("+adminRating"); // Include adminRating for processing

  // Update adminRating to rating and remove adminRating from response
  const updatedDecorators = decorators.map((decorator) => {
      if (decorator.adminRating) {
          decorator.rating = decorator.adminRating; // Use adminRating as the rating
          delete decorator.adminRating; // Remove adminRating from the response
      }
      return decorator;
  });

  // Update or create the analytics entry for the decorator view directly with event type
  await Analytics.findOneAndUpdate(
      { eventType: "Decorator" }, 
      { $inc: { views: 1 } }, 
      { upsert: true, new: true }
  );

  // If decorator data is successfully fetched, return success response
  res.status(200).json({
      message: 'success',
      length: updatedDecorators.length,
      data: updatedDecorators,
  });
});

exports.getDecorator = catchAsync(async (req, res, next) => {
  const decorator = await Decorator.findById(req.params.id)
      .select('-reviews +adminRating') // Exclude reviews and include adminRating for processing
      .lean(); // Convert the document to a plain JavaScript object for better performance

  // Check if decorator is found
  if (!decorator) {
      return next(new AppError('Decorator not found', 404));
  }

  // Replace rating with adminRating if it exists and remove adminRating from the response
  if (decorator.adminRating) {
      decorator.rating = decorator.adminRating; // Use adminRating as the rating
      delete decorator.adminRating; // Remove adminRating from the response
  }

  // Fetch only the first 10 reviews separately if there are any reviews
  const reviews = await Decorator.findById(req.params.id)
      .select('reviews')
      .slice('reviews', 10) // Limit to the first 10 reviews
      .lean();

  // Merge the limited reviews into the decorator object
  if (reviews && reviews.reviews) {
      decorator.reviews = reviews.reviews;
  }

  // If found, return success response
  res.status(200).json({
      message: 'success',
      data: decorator,
  });
});



// exports.deleteDecorator = catchAsync(async (req, res, next) => {
//     const decorator = await Decorator.findByIdAndDelete(req.params.id);
//     if (!decorator) {
//       return next(new AppError('No document found with that ID', 404));
//     }
//     res.status(204).json({
//       status: 'success',
//       data: null,
//     });
//   });

  exports.createDecorator = catchAsync(async (req, res, next) => {
    const {
      name,
      description,
      contactUs,
      location,
      price,
      whatsApp,
      yearOfEstd
    } = req.body;
  
    // Create a new decorator entry in the database
    const newDecorator = await Decorator.create({
      name,
      description,
      contactUs,
      location,
      price,
      whatsApp,
      yearOfEstd
    });

    await User.findByIdAndUpdate(
      req.user._id, 
      { $push: { 'post.Decorator': { $each: [newDecorator._id], $position: 0 } } }, 
      { new: true } // Return the updated document
    );
  
    // Send back a response with the newly created decorator
    res.status(201).json({
      status: 'success',
      data: {
        decorator: newDecorator,
      },
    });
  })

  exports.patchDecorator = catchAsync(async (req, res, next) => {
    const { id } = req.params; // Assuming the decorator ID is passed as a parameter in the URL
  
    // Destructure the request body to extract fields that can be updated
    const {
      name,
      description,
      contactUs,
      location,
      price,
      whatsApp,
      yearOfEstd
    } = req.body;
  
    // Build the update object dynamically based on fields provided in req.body
    const updateFields = {
      ...(name && { name }),
      ...(description && { description }),
      ...(contactUs  && { contactUs  }),
      ...(location && { location }),
      ...(price && { price }),
      ...(yearOfEstd && { yearOfEstd }),
      ...(whatsApp && {whatsApp})
    };
  
    // Update the decorator entry if any fields are provided
    if (Object.keys(updateFields).length > 0) {
      const updatedDecorator = await Decorator.findByIdAndUpdate(
        id,
        { $set: updateFields },
        { new: true, runValidators: true } // Return the updated document and validate changes
      );
  
      if (!updatedDecorator) {
        return next(new AppError('No decorator found with that ID', 404));
      }
  
      // Send response
      return res.status(200).json({
        status: "success",
        data: {
          decorator: updatedDecorator,
        },
      });
    }
  
    // If no fields were provided in the body, return a 400 response
    return res.status(400).json({
      status: "fail",
      message: "No fields provided for update",
    });
  });
  