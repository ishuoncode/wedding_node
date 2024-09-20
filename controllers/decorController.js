const Decorator = require('../models/decoratorModal');
const catchAsync = require('./../utils/catchAsync');
const { buildFiltersAndSort } = require('./utilsController');

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
