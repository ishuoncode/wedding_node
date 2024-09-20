const Banquet = require('../models/banquetModal');
const catchAsync = require('./../utils/catchAsync');
const { buildFiltersAndSort } = require('./utilsController');


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

