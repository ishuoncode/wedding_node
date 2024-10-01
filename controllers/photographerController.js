const Photographer = require('../models/photographerModal');
const catchAsync = require('./../utils/catchAsync');
const { buildFiltersAndSort } = require('./utilsController');
const AppError  = require("../utils/appError");
const User = require('../models/userModal');

exports.getAllPhotographer = catchAsync(async (req, res, next) => {
    const { query } = req;
    const { filters, sort } = buildFiltersAndSort(query);

    // Fetch banquet data based on filters and sorting
    const photographer = await Photographer.find(filters).sort(sort);

    // If banquet data is successfully fetched, return success response
    res.status(200).json({
      message: 'success',
      length: photographer.length,
      data: photographer,
    });
})

exports.getPhotographer = catchAsync(async (req, res, next) => {
    const photographer = await Photographer.findById(req.params.id);
    
    // Check if banquet is found
    if (!photographer) {
        return next(new AppError('photographer not found', 404));
    }

    // If found, return success response
    res.status(200).json({
        message: 'success',
        data: photographer,
    });
});

exports.deletePhotographer = catchAsync(async (req, res, next) => {
    const photographer = await Photographer.findByIdAndDelete(req.params.id);
    if (!photographer) {
      return next(new AppError('No document found with that ID', 404));
    }
    res.status(204).json({
      status: 'success',
      data: null,
    });
  });

  exports.createPhotographer = catchAsync(async (req, res, next) => {
    const {
      name,
      description,
      location,
      price,
      yearOfEstd,
      services,
      occasion
    } = req.body;
  
    // Create a new photographer entry in the database
    const newPhotographer = await Photographer.create({
      name,
      description,
      location,
      price,
      yearOfEstd,
      services,
      occasion
    });

    await User.findByIdAndUpdate(
      req.user._id, 
      { $push: { 'post.Photographer': { $each: [newPhotographer._id], $position: 0 } } }, 
      { new: true } // Return the updated document
    );
  
    // Send back a response with the newly created photographer
    res.status(201).json({
      status: 'success',
      data: {
        photographer: newPhotographer,
      },
    });
  });