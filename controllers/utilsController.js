// const Banquet = require('../models/banquetModal');
// const Photographer = require('../models/photographerModal');
// const Caterer = require('../models/catererModal');
// const Decorator = require('../models/decoratorModal');
const catchAsync = require("./../utils/catchAsync");
const AppError = require("../utils/appError");
const { uploadMultipleFiles, deleteMultipleFiles } = require("./awsController");

const models = {
  Banquet: require("../models/banquetModal"),
  Caterer: require("../models/catererModal"),
  Photographer: require("../models/photographerModal"),
  Decorator: require("../models/decoratorModal"),
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
      const key = decodeURIComponent(url.split('.com/')[1]); // Extract the part after ".com/"
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
