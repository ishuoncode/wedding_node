const Photographer = require('../models/photographerModal');
const catchAsync = require('./../utils/catchAsync');
const { buildFiltersAndSort } = require('./utilsController');
const AppError  = require("../utils/appError")

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