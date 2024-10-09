const Decorator = require('../models/decoratorModal');
const catchAsync = require('./../utils/catchAsync');
const { buildFiltersAndSort } = require('./utilsController');
const AppError  = require("../utils/appError");
const User = require('../models/userModal');

exports.getAllDecorator = catchAsync(async (req, res, next) => {
    const { query } = req;
    const { filters, sort } = buildFiltersAndSort(query);

    // Fetch banquet data based on filters and sorting
    const decorator = await Decorator.find(filters).sort(sort);

    // If banquet data is successfully fetched, return success response
    res.status(200).json({
      message: 'success',
      length: decorator.length,
      data: decorator,
    });
})

exports.getDecorator = catchAsync(async (req, res, next) => {
    const decorator = await Decorator.findById(req.params.id);
    
    // Check if banquet is found
    if (!decorator) {
        return next(new AppError('decorator not found', 404));
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
      yearOfEstd
    } = req.body;
  
    // Create a new decorator entry in the database
    const newDecorator = await Decorator.create({
      name,
      description,
      contactUs,
      location,
      price,
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
  