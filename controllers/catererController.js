const Caterer = require('../models/catererModal');
const catchAsync = require('./../utils/catchAsync');
const { buildFiltersAndSort } = require('./utilsController');
const AppError  = require("../utils/appError");
const User = require('../models/userModal');

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
  const caterer = await Caterer.findById(req.params.id)
      .select('-reviews') // Exclude reviews initially
      .lean(); // Convert the document to a plain JavaScript object for better performance

  // Check if caterer is found
  if (!caterer) {
      return next(new AppError('Caterer not found', 404));
  }

  // Fetch only the first 10 reviews separately if there are any reviews
  const reviews = await Caterer.findById(req.params.id)
      .select('reviews')
      .slice('reviews', 10) // Limit to the first 10 reviews
      .lean();

  // Merge the limited reviews into the caterer object
  if (reviews && reviews.reviews) {
      caterer.reviews = reviews.reviews;
  }

  // If found, return success response
  res.status(200).json({
      message: 'success',
      data: caterer,
  });
});


// exports.deleteCaterer = catchAsync(async (req, res, next) => {
//     const caterer = await Caterer.findByIdAndDelete(req.params.id);
//     if (!caterer) {
//       return next(new AppError('No document found with that ID', 404));
//     }
//     res.status(204).json({
//       status: 'success',
//       data: null,
//     });
//   });

  exports.createCaterer = catchAsync(async (req, res, next) => {
    // Destructure the request body
    const {
      name,
      description,
      yearOfEstd,
      contactUs,
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
      contactUs,
      billboard,
      photos,
      basic,
      standard,
      deluxe,
    });

    await User.findByIdAndUpdate(
      req.user._id, 
      { $push: { 'post.Caterer': { $each: [newCaterer._id], $position: 0 } } }, 
      { new: true } // Return the updated document
    );
  
    // Respond with the newly created caterer
    res.status(201).json({
      status: 'success',
      data: {
        caterer: newCaterer,
      },
    });
  });


  exports.patchCaterer = catchAsync(async (req, res, next) => {
    const { id } = req.params; // Assuming the caterer ID is passed as a parameter in the URL
  
    // Destructure the request body to extract fields that can be updated
    const {
      name,
      description,
      yearOfEstd,
      contactUs,
      billboard,
      photos,
      basic,
      standard,
      deluxe,
    } = req.body;
  
    // Build the update object dynamically based on fields provided in req.body
    const updateFields = {
      ...(name && { name }),
      ...(description && { description }),
      ...(yearOfEstd && { yearOfEstd }),
      ...(contactUs && { contactUs }),
      ...(billboard && { billboard }),
      ...(photos && { photos }),
      ...(basic && { basic }),
      ...(standard && { standard }),
      ...(deluxe && { deluxe }),
    };
  
    // Update the caterer entry if any fields are provided
    if (Object.keys(updateFields).length > 0) {
      const updatedCaterer = await Caterer.findByIdAndUpdate(
        id,
        { $set: updateFields },
        { new: true, runValidators: true } // Return the updated document and validate changes
      );
  
      if (!updatedCaterer) {
        return next(new AppError('No caterer found with that ID', 404));
      }
  
      // Send response
      return res.status(200).json({
        status: "success",
        data: {
          caterer: updatedCaterer,
        },
      });
    }
  
    // If no fields were provided in the body, return a 400 response
    return res.status(400).json({
      status: "fail",
      message: "No fields provided for update",
    });
  });
  