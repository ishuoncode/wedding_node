const Photographer = require('../models/photographerModal');
const catchAsync = require('./../utils/catchAsync');
const { buildFiltersAndSort } = require('./utilsController');

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
