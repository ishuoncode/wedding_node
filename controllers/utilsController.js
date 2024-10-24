// const Banquet = require('../models/banquetModal');
// const Photographer = require('../models/photographerModal');
// const Caterer = require('../models/catererModal');
// const Decorator = require('../models/decoratorModal');
const catchAsync = require("./../utils/catchAsync");
const AppError = require("../utils/appError");
const { uploadMultipleFiles, deleteMultipleFiles } = require("./awsController");
const User = require("../models/userModal");

const extractPart = (array) => {
  return array.map((url) => {
    const key = decodeURIComponent(url.split(".com/")[1]); // Extract the part after ".com/"
    return key ? key : ""; // Return the extracted key or an empty string if not found
  });
};

const models = {
  Banquet: require("../models/banquetModal"),
  Caterer: require("../models/catererModal"),
  Photographer: require("../models/photographerModal"),
  Decorator: require("../models/decoratorModal"),
};

const visitModels = {
  Banquet: require("../models/banquetVisit"),
  Caterer: require("../models/catererVisit"),
  Photographer: require("../models/photographerVisit"),
  Decorator: require("../models/decoratorVisit"),
};

exports.buildFiltersAndSort = (query) => {
  const filters = {};
  let sort = {}; // To hold sorting criteria

  // Filter Logic
  for (const [key, value] of Object.entries(query)) {
    switch (key) {
      case "rating":
        if (value === "true") {
          filters.rating = { $gte: 4 }; // Filter for ratings 4 and above
        }
        break;
      case "budgetFriendly":
        if (value === "true") {
          filters.price = { $lte: 30000 }; // Budget-friendly filter
        }
        break;
      case "city":
        if (value) {
          filters["location.city"] = value.toLowerCase(); // Convert city to lowercase for case-insensitive filtering
        }
        break;
      case "pincode":
        if (value) {
          filters["location.pincode"] = value; // Apply pincode filter if provided
        }
        break;
      case "sortBy":
        if (value === "priceLowToHigh") {
          sort.price = 1; // Sort price low to high
        } else if (value === "priceHighToLow") {
          sort.price = -1; // Sort price high to low
        }
        break;
      default:
        break;
    }
  }

  return { filters, sort };
};

exports.addNewFolder = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { name, category } = req.body;
  console.log("Uploaded files:", req.files);

  const Model = models[category];
  if (!Model) {
    return next(new AppError(`No model found for category: ${category}`, 400));
  }

  if (!name) {
    return next(new AppError("New gallery folder must have a name", 400));
  }

  // Find the banquet by ID
  const entity = await Model.findById(id);
  if (!entity) {
    return next(
      new AppError(`No ${category.toLowerCase()} found with that ID`, 404)
    );
  }

  // Ensure there are files uploaded
  if (
    !req.files ||
    !req.files["photos[]"] ||
    req.files["photos[]"].length === 0
  ) {
    return next(new AppError("You must upload at least one photo", 400));
  }

  // Prepare files for uploading to S3
  const files = req.files["photos[]"].map((file) => ({
    filename: `${category.toLowerCase()}-${id}-${file.originalname}`, // Dynamically generate filename
    buffer: file.buffer, // Buffer data
    ContentType: file.mimetype, // Content type
  }));

  // Upload files to S3
  const photoUrls = await uploadMultipleFiles(
    files,
    `dream-wedding/images/${category.toLowerCase()}/media/${id}`
  );

  // Create a new gallery folder object with S3 URLs
  const newGalleryFolder = {
    name,
    photos: photoUrls, // Use the URLs returned from S3
  };

  // Add the new gallery folder to the banquet
  entity.gallery.push(newGalleryFolder);

  // Save the updated banquet
  const updatedEntity = await entity.save({ validateBeforeSave: true });

  // Respond with the updated banquet
  res.status(201).json({
    status: "success",
    data: {
      [category.toLowerCase()]: updatedEntity,
    },
  });
});

exports.patchFolder = catchAsync(async (req, res, next) => {
  const { id, folderid } = req.params;
  const { deleteImageArray, category } = req.body; // Extract deleteImageArray from request body

  // Dynamically select the model based on the category
  const Model = models[category];
  if (!Model) {
    return next(new AppError(`No model found for category: ${category}`, 400));
  }

  // Find the entity (e.g., Banquet or Caterer) by ID
  const entity = await Model.findById(id);
  if (!entity) {
    return next(new AppError(`${category} not found with that ID`, 404));
  }

  // Find the gallery folder by folder ID
  const gallery = entity.gallery.find(
    (item) => item._id.toString() === folderid
  );
  if (!gallery) {
    return next(new AppError("Gallery not found", 404));
  }

  if (deleteImageArray && deleteImageArray.length > 0) {
    // Extract S3 keys from deleteImageArray (URLs)
    const extractPart = (array) => {
      return array.map((url) => {
        const key = decodeURIComponent(url.split(".com/")[1]); // Extract the part after ".com/"
        return key ? key : ""; // Return the extracted key or an empty string if not found
      });
    };

    const DeleteFolderImages = extractPart(deleteImageArray);
    console.log(DeleteFolderImages, "Images to delete");

    // Delete images from S3 if needed
    if (DeleteFolderImages && DeleteFolderImages.length > 0) {
      await deleteMultipleFiles(DeleteFolderImages, `dream-wedding`); // Pass only the key prefix
      // Remove deleted images from the gallery photos array
      gallery.photos = gallery.photos.filter(
        (photo) => !deleteImageArray.includes(photo)
      );
    }
  }
  // Upload new images if provided
  if (req.files && req.files["addImagesArray[]"]) {
    const files = req.files["addImagesArray[]"].map((file) => ({
      filename: `${category.toLowerCase()}-${id}-${file.originalname}`, // Dynamic filename based on category
      buffer: file.buffer,
      ContentType: file.mimetype,
    }));

    // Upload files and get the uploaded URLs
    const uploadedUrls = await uploadMultipleFiles(
      files,
      `dream-wedding/images/${category.toLowerCase()}/media/${id}`
    );
    console.log(uploadedUrls, "Uploaded URLs");

    // Add uploaded URLs to the gallery photos array
    gallery.photos.push(...uploadedUrls);
  }

  // Save the updated entity
  await entity.save();

  // Return success response with the updated entity
  res.status(200).json({
    status: "success",
    data: {
      [category.toLowerCase()]: entity, // Return the correct entity name dynamically
    },
  });
});

exports.deleteEntity = catchAsync(async (req, res, next) => {
  const { id, category } = req.params;
  const userid = req.user._id.toString();

  // Dynamically select the model based on the category
  const Model = models[category];
  const VisitModel = visitModels[category]; // Get the corresponding visit model
 

  if (!Model || !VisitModel) {
    return next(new AppError(`No model found for category: ${category}`, 400));
  }

  // Find the entity (e.g., Banquet, Caterer) by ID
  const entity = await Model.findById(id);
  if (!entity) {
    return next(new AppError(`${category} not found with that ID`, 404));
  }

  // Extract all photos from the entity's gallery
  const deleteImages = entity.gallery.flatMap((item) => item.photos);

  // Delete images from S3 and the entity itself
  if (deleteImages && deleteImages.length > 0) {
    const DeleteFolderImages = extractPart(deleteImages); // You would have your extractPart function here

    if (DeleteFolderImages && DeleteFolderImages.length > 0) {
      try {
        await deleteMultipleFiles(DeleteFolderImages, `dream-wedding`); // Delete images from S3
        await Model.findByIdAndDelete(id); // Delete the entity

        // Check if the visit model has a banquetId field
        if (VisitModel.schema.path('banquetId')) {
          await VisitModel.deleteMany({ banquetId: id }); // Delete associated visit records
        }
      } catch (err) {
        return next(new AppError("Failed to delete images from S3", 500));
      }
    }
  } else {
    // If no images to delete, directly delete the entity
    await Model.findByIdAndDelete(id);

    if (VisitModel.schema.path('banquetId')) {
      await VisitModel.deleteMany({ banquetId: id }); // Delete associated visit records
    }
  }

  // Now find the user and update their post
  const user = await User.findById(userid);
  if (!user) {
    return next(new AppError("User not found", 404));
  }

  // Check if the category exists in the user's post and remove the ID
  if (user.post[category]) {
    user.post[category] = user.post[category].filter(postId => postId.toString() !== id);
    await user.save(); // Save the updated user document
  }

  return res.status(204).json({
    status: "success",
    data: null,
  });
});



exports.addWishlist = catchAsync(async (req, res, next) => {
  // console.log("sdjskdjskdjdksdjksdjkjdsdksdksdssd");
  // console.log(req.user._id,"id")
  const id = req.user._id.toString();
  const { itemId, category } = req.body;

  const validCategories = ["Banquet", "Caterer", "Photographer", "Decorator"]; // Ensure category matches lowercase
  if (!validCategories.includes(category)) {
    return res
      .status(400)
      .json({ status: "error", message: "Invalid category" });
  }

  const user = await User.findByIdAndUpdate(
    id,
    {
      $push: {
        [`wishlist.${category}`]: {
          $each: [itemId], // The item to add
          $position: 0, // Ensures the item is added at the start of the array
        },
      },
    },
    { new: true, runValidators: true } // Ensure validation runs and return the updated document
  );
  if (!user) {
    return res.status(404).json({ status: "error", message: "User not found" });
  }
  res.status(200).json({
    status: "success",
    data: {
      user,
    },
  });
});

exports.removeWishlist = catchAsync(async (req, res, next) => {
  const id = req.user._id.toString(); // Get the user's ID
  const { itemId, category } = req.body; // Extract itemId and category from the request body

  const validCategories = ["Banquet", "Caterer", "Photographer", "Decorator"]; // Define valid categories

  // Check if the provided category is valid
  if (!validCategories.includes(category)) {
    return res
      .status(400)
      .json({ status: "error", message: "Invalid category" });
  }

  // Update the user's wishlist to remove the specified item
  const user = await User.findByIdAndUpdate(
    id,
    { $pull: { [`wishlist.${category}`]: itemId } }, // Use $pull to remove the item
    { new: true, runValidators: true } // Ensure validation runs
  );

  // Check if the user was found and updated
  if (!user) {
    return res.status(404).json({ status: "error", message: "User not found" });
  }

  // Return the updated user data
  res.status(200).json({
    status: "success",
    data: {
      user,
    },
  });
});

exports.userReview = catchAsync(async (req, res, next) => {
  const userid = req.user._id.toString();
  const { id } = req.params;
  const { category, tag, content, rating, username, userphoto } = req.body;

  const Model = models[category];
  if (!Model) {
    return next(new AppError(`No model found for category: ${category}`, 400));
  }

  // Check for mandatory fields
  if (!content || !rating || !username) {
    return next(
      new AppError("Please provide content, rating, and username", 400)
    );
  }

  const item = await Model.findById(id);
  if (!item) {
    return next(new AppError(`No item found with ID: ${id}`, 404));
  }

  const existingReview = item.reviews.find(
    (review) => review.userId.toString() === userid
  );

  if (existingReview) {
    // Update the existing review
    existingReview.tag = tag;
    existingReview.content = content;
    existingReview.rating = rating;
    existingReview.username = username; // Update username if necessary
    existingReview.userphoto = userphoto; // Update userphoto if provided
    existingReview.date = new Date();
  } else {
    // Add a new review at the beginning of the array
    const newReview = {
      userId: userid,
      tag,
      content,
      rating,
      username, // Include username
      userphoto, // Include userphoto (optional)
      date: new Date(),
    };

    item.reviews.unshift(newReview); // Add the new review at the 0 index
  }

  // Calculate the average rating
  const totalRatings = item.reviews.reduce((acc, review) => acc + review.rating, 0);
  const avgRating = totalRatings / item.reviews.length;

  // Save the calculated average rating to the avgRating field
  item.rating = avgRating;

  await item.save();

  res.status(200).json({
    status: "success",
    data: {
      item,
      rating, // Include the updated average rating in the response
    },
  });
});


exports.deleteReview = catchAsync(async (req, res, next) => {
  const userid = req.user._id.toString();
  const { id } = req.params;
  const { category } = req.query;

  const Model = models[category];
  if (!Model) {
    return next(new AppError(`No model found for category: ${category}`, 400));
  }

  // Find the item by its ID
  const item = await Model.findById(id);
  if (!item) {
    return next(new AppError(`No item found with ID: ${id}`, 404));
  }

  // Find the review index for the user
  const reviewIndex = item.reviews.findIndex(
    (review) => review.userId.toString() === userid
  );

  if (reviewIndex === -1) {
    return next(new AppError("Review not found for this user", 404));
  }

  // Remove the review from the array
  item.reviews.splice(reviewIndex, 1);

  // Save the updated item
  await item.save();

  res.status(204).json({
    status: "success",
    data: null,
  });
});

exports.getMoreReviews = catchAsync(async (req, res, next) => {
  const { id, category } = req.params;
  const { page = 1, limit = 10 } = req.query;

  // Validate the inputs
  const pageNumber = parseInt(page, 10);
  const limitNumber = parseInt(limit, 10);

  if (
    isNaN(pageNumber) ||
    isNaN(limitNumber) ||
    pageNumber <= 0 ||
    limitNumber <= 0
  ) {
    return next(new AppError("Invalid page or limit values", 400));
  }

  // Get the model based on the category
  const Model = models[category]; // Assuming models is an object containing your Mongoose models
  if (!Model) {
    return next(new AppError(`No model found for category: ${category}`, 400));
  }

  // Fetch the item and limit the number of reviews
  const item = await Model.findById(id)
    .select("reviews")
    .slice("reviews", [(pageNumber - 1) * limitNumber, limitNumber])
    .lean();

  if (!item) {
    return next(
      new AppError(
        `${category.charAt(0).toUpperCase() + category.slice(1)} not found`,
        404
      )
    );
  }

  // Return the reviews
  res.status(200).json({
    status: "success",
    data: {
      reviews: item.reviews,
      page: pageNumber,
      limit: limitNumber,
    },
  });
});

exports.updateVisit = catchAsync(async (req, res, next) => {
  const { id: banquetId, category } = req.params; // Rename id to banquetId for clarity

  // Get the model based on the category
  const Model = visitModels[category];
  if (!Model) {
    return next(new AppError(`No model found for category: ${category}`, 400));
  }

  // Get current year and month
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear().toString(); // String for consistency
  const currentMonth = currentDate.toLocaleString("default", { month: "long" }); // Full month name

  // Build the query to find the document by banquetId and check for year and month
  const query = {
    banquetId: banquetId, // Use banquetId from params
    "years.year": currentYear, // Check if the current year exists
    "years.monthlyVisits.month": currentMonth, // Check if the current month exists
  };

  // Use `$inc` to increase visits if the document exists
  const update = {
    $inc: { "years.$[yearElem].monthlyVisits.$[monthElem].visits": 1 },
  };

  // Array filters to update the matching year and month
  const options = {
    arrayFilters: [
      { "yearElem.year": currentYear }, // Match year
      { "monthElem.month": currentMonth }, // Match month
    ],
    new: true, // Return the updated document
    upsert: false, // Don't create the document here, fallback to second step
  };

  // First, try to find the document by banquetId and update the visit count
  const updatedItem = await Model.findOneAndUpdate(query, update, options);

  // If the document, year, or month doesn't exist, handle pushing them in a second step
  if (!updatedItem) {
    // Now handle creating the document, or adding the year/month if missing
    await Model.findOneAndUpdate(
      { banquetId: banquetId }, // Ensure we match by banquetId
      {
        $setOnInsert: { banquetId: banquetId }, // Only set the banquetId if creating a new document
        $push: {
          years: {
            year: currentYear,
            monthlyVisits: [{ month: currentMonth, visits: 1 }],
          },
        },
      },
      { new: true, upsert: true } // Create if not exists, return the new document
    );
  }

  res.status(200).json({
    status: "success",
    data: { updatedItem },
  });
});



exports.getVisitData = catchAsync(async (req, res, next) => {
  const { id: banquetId, category } = req.params; // Extract banquetId and category from params

  // Get the model based on the category
  const Model = visitModels[category];
  if (!Model) {
    return next(new AppError(`No model found for category: ${category}`, 400));
  }

  // Find the document by banquetId
  const visitData = await Model.findOne({ banquetId: banquetId });

  // If no visit data is found, return an appropriate error message
  if (!visitData) {
    return next(new AppError(`No visit data found for banquetId: ${banquetId}`, 404));
  }

  res.status(200).json({
    status: "success",
    data: visitData, // Return the visit data
  });
});

exports.getGlobalSearch = catchAsync(async (req, res, next) => {
  // Get the search term from the query
  const searchTerm = req.query.search || '';

  if (!searchTerm) {
      return res.status(400).json({ message: 'Search term is required' });
  }

  // Get pagination parameters
  const page = parseInt(req.query.page) || 1; // Default to 1 if not provided
  const limit = parseInt(req.query.limit) || 10; // Default to 10 if not provided
  const skip = (page - 1) * limit; // Calculate how many records to skip

  // Define the search query
  const searchQuery = {
      $or: [
          { name: { $regex: searchTerm, $options: 'i' } },
          { description: { $regex: searchTerm, $options: 'i' } }
      ]
  };

  // Search in all models concurrently with pagination
  const [banquets, caterers, photographers, decorators] = await Promise.all([
      models.Banquet.find(searchQuery).select('name location services description price capacity rating gallery').skip(skip).limit(limit),
      models.Caterer.find(searchQuery).select('name price services description location rating gallery').skip(skip).limit(limit),
      models.Photographer.find(searchQuery).select('name services price description location rating gallery').skip(skip).limit(limit),
      models.Decorator.find(searchQuery).select('name description price location rating gallery').skip(skip).limit(limit),
  ]);

  // Count total documents for pagination
  const [totalBanquets, totalCaterers, totalPhotographers, totalDecorators] = await Promise.all([
      models.Banquet.countDocuments(searchQuery),
      models.Caterer.countDocuments(searchQuery),
      models.Photographer.countDocuments(searchQuery),
      models.Decorator.countDocuments(searchQuery),
  ]);

  // Create an object to hold separate results and pagination info
  const results = {
      banquets,
      caterers,
      photographers,
      decorators,
      pagination: {
          currentPage: page,
          totalPages: Math.ceil((totalBanquets + totalCaterers + totalPhotographers + totalDecorators) / limit), // Total pages based on all models
          totalItems: totalBanquets + totalCaterers + totalPhotographers + totalDecorators, // Total items across all models
      },
  };

  // Send the response with separate result sets and pagination info
  res.status(200).json({
      status: 'success',
      data: results,
  });
});