const Photographer = require('../models/photographerModal');
const Analytics = require("../models/analyticsModal");
const catchAsync = require('./../utils/catchAsync');
const { buildFiltersAndSort } = require('./utilsController');
const AppError  = require("../utils/appError");
const User = require('../models/userModal');

exports.getAllPhotographer = catchAsync(async (req, res, next) => {
  const { query } = req;
  const { filters, sort } = buildFiltersAndSort(query);

  // Fetch photographer data based on filters and sorting
  const photographers = await Photographer.find(filters).sort(sort).select("+adminRating"); // Include adminRating for processing

  // Update adminRating to rating and remove adminRating from response
  const updatedPhotographers = photographers.map((photographer) => {
      if (photographer.adminRating) {
          photographer.rating = photographer.adminRating; // Use adminRating as the rating
          delete photographer.adminRating; // Remove adminRating from the response
      }
      return photographer;
  });

  // Update or create the analytics entry for the photographer view directly with event type
  await Analytics.findOneAndUpdate(
      { eventType: "Photographer" }, 
      { $inc: { views: 1 } }, 
      { upsert: true, new: true }
  );

  // If photographer data is successfully fetched, return success response
  res.status(200).json({
      message: 'success',
      length: updatedPhotographers.length,
      data: updatedPhotographers,
  });
});

exports.getPhotographer = catchAsync(async (req, res, next) => {
  const photographer = await Photographer.findById(req.params.id)
      .select('-reviews +adminRating') // Exclude reviews and include adminRating for processing
      .lean(); // Convert the document to a plain JavaScript object for better performance

  // Check if photographer is found
  if (!photographer) {
      return next(new AppError('Photographer not found', 404));
  }

  // Replace rating with adminRating if it exists and remove adminRating from the response
  if (photographer.adminRating) {
      photographer.rating = photographer.adminRating; // Use adminRating as the rating
      delete photographer.adminRating; // Remove adminRating from the response
  }

  // Fetch only the first 10 reviews separately if there are any reviews
  const reviews = await Photographer.findById(req.params.id)
      .select('reviews')
      .slice('reviews', 10) // Limit to the first 10 reviews
      .lean();

  // Merge the limited reviews into the photographer object
  if (reviews && reviews.reviews) {
      photographer.reviews = reviews.reviews;
  }

  // If found, return success response
  res.status(200).json({
      message: 'success',
      data: photographer,
  });
});



// exports.deletePhotographer = catchAsync(async (req, res, next) => {
//     const photographer = await Photographer.findByIdAndDelete(req.params.id);
//     if (!photographer) {
//       return next(new AppError('No document found with that ID', 404));
//     }
//     res.status(204).json({
//       status: 'success',
//       data: null,
//     });
//   });

  exports.createPhotographer = catchAsync(async (req, res, next) => {
    const {
      name,
      description,
      location,
      price,
      specialFeatures,
      yearOfEstd,
      contactUs,
      services,
      whatsApp,
      occasion
    } = req.body;
  
    // Create a new photographer entry in the database
    const newPhotographer = await Photographer.create({
      name,
      description,
      location,
      price,
      specialFeatures,
      yearOfEstd,
      contactUs,
      services,
      whatsApp,
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

  exports.patchPhotographer = catchAsync(async (req, res, next) => {
    const { id } = req.params; // Assuming the photographer ID is passed as a parameter in the URL
  
    // Destructure the request body to extract fields that can be updated
    const {
      name,
      description,
      location,
      price,
      specialFeatures,
      yearOfEstd,
      contactUs,
      whatsApp,
      services,
      occasion
    } = req.body;
  
    // Build the update object dynamically based on fields provided in req.body
    const updateFields = {
      ...(name && { name }),
      ...(description && { description }),
      ...(location && { location }),
      ...(price && { price }),
      ...(yearOfEstd && { yearOfEstd }),
      ...(contactUs && { contactUs }),
      ...(services && { services }),
      ...(specialFeatures && { specialFeatures }),
      ...(occasion && { occasion }),
      ...(whatsApp && {whatsApp})
    };
  
    // Update the photographer entry if any fields are provided
    if (Object.keys(updateFields).length > 0) {
      const updatedPhotographer = await Photographer.findByIdAndUpdate(
        id,
        { $set: updateFields },
        { new: true, runValidators: true } // Return the updated document and validate changes
      );
  
      if (!updatedPhotographer) {
        return next(new AppError('No photographer found with that ID', 404));
      }
  
      // Send response
      return res.status(200).json({
        status: "success",
        data: {
          photographer: updatedPhotographer,
        },
      });
    }
  
    // If no fields were provided in the body, return a 400 response
    return res.status(400).json({
      status: "fail",
      message: "No fields provided for update",
    });
  });
  