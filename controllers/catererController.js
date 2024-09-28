const Caterer = require('../models/catererModal');
const catchAsync = require('./../utils/catchAsync');
const { buildFiltersAndSort } = require('./utilsController');
const AppError  = require("../utils/appError")

exports.getAllCaterer = catchAsync(async (req, res, next) => {
    const { query } = req;
    const { filters, sort } = buildFiltersAndSort(query);

    // Fetch banquet data based on filters and sorting
    const caterer = await Caterer.find(filters).sort(sort);

    // If banquet data is successfully fetched, return success response
    res.status(200).json({
      message: 'success',
      length: caterer.length,
      data: caterer,
    });
})

exports.getCaterer = catchAsync(async (req, res, next) => {
    const caterer = await Caterer.findById(req.params.id);
    
    // Check if banquet is found
    if (!caterer) {
        return next(new AppError('caterer not found', 404));
    }

    // If found, return success response
    res.status(200).json({
        message: 'success',
        data: caterer,
    });
});

exports.deleteCaterer = catchAsync(async (req, res, next) => {
    const caterer = await Caterer.findByIdAndDelete(req.params.id);
    if (!caterer) {
      return next(new AppError('No document found with that ID', 404));
    }
    res.status(204).json({
      status: 'success',
      data: null,
    });
  });

  exports.createCaterer = catchAsync(async (req, res, next) => {
    // Destructure the request body
    const {
      name,
      description,
      yearOfEstd,
      billboard,
      photos,
      basic,
      standard,
      deluxe,
    } = req.body;
  
    // Create a new caterer instance
    const newCaterer = await Caterer.create({
      name,
      description,
      yearOfEstd,
      billboard,
      photos,
      basic,
      standard,
      deluxe,
    });
  
    // Respond with the newly created caterer
    res.status(201).json({
      status: 'success',
      data: {
        caterer: newCaterer,
      },
    });
  });