const Banquet = require('../models/banquetModal');
const catchAsync = require('./../utils/catchAsync');
const { buildFiltersAndSort } = require('./utilsController');
const AppError  = require("../utils/appError")


exports.getAllBanquet = catchAsync(async (req, res, next) => {
    const { query } = req;
    const { filters, sort } = buildFiltersAndSort(query);

    // Fetch banquet data based on filters and sorting
    const banquet = await Banquet.find(filters).sort(sort);

    // If banquet data is successfully fetched, return success response
    res.status(200).json({
      message: 'success',
      length: banquet.length,
      data: banquet,
    });
})

exports.getBanquet = catchAsync(async (req, res, next) => {
    const banquet = await Banquet.findById(req.params.id);
    
    // Check if banquet is found
    if (!banquet) {
        return next(new AppError('Banquet not found', 404));
    }

    // If found, return success response
    res.status(200).json({
        message: 'success',
        data: banquet,
    });
});

exports.deleteBanquet = catchAsync(async (req, res, next) => {
    const banquet = await Banquet.findByIdAndDelete(req.params.id);
    if (!banquet) {
      return next(new AppError('No document found with that ID', 404));
    }
    res.status(204).json({
      status: 'success',
      data: null,
    });
  });
  