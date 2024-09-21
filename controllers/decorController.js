const Decorator = require('../models/decoratorModal');
const catchAsync = require('./../utils/catchAsync');
const { buildFiltersAndSort } = require('./utilsController');
const AppError  = require("../utils/appError")

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

exports.deleteDecorator = catchAsync(async (req, res, next) => {
    const decorator = await Decorator.findByIdAndDelete(req.params.id);
    if (!decorator) {
      return next(new AppError('No document found with that ID', 404));
    }
    res.status(204).json({
      status: 'success',
      data: null,
    });
  });