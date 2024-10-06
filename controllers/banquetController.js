const Banquet = require("../models/banquetModal");
const catchAsync = require("./../utils/catchAsync");
const { buildFiltersAndSort } = require("./utilsController");
const AppError = require("../utils/appError");
const { uploadMultipleFiles, deleteMultipleFiles } = require("./awsController");
const User = require("../models/userModal");

const extractPart = (array) => array.map((url) => url.split("/").pop());

exports.getAllBanquet = catchAsync(async (req, res, next) => {
  const { query } = req;
  const { filters, sort } = buildFiltersAndSort(query);

  // Fetch banquet data based on filters and sorting
  const banquet = await Banquet.find(filters).sort(sort);

  // If banquet data is successfully fetched, return success response
  res.status(200).json({
    message: "success",
    length: banquet.length,
    data: banquet,
  });
});

exports.getBanquet = catchAsync(async (req, res, next) => {
  const banquet = await Banquet.findById(req.params.id);

  // Check if banquet is found
  if (!banquet) {
    return next(new AppError("Banquet not found", 404));
  }

  // If found, return success response
  res.status(200).json({
    message: "success",
    data: banquet,
  });
});

exports.deleteBanquet = catchAsync(async (req, res, next) => {
  const banquet = await Banquet.findByIdAndDelete(req.params.id);
  if (!banquet) {
    return next(new AppError("No document found with that ID", 404));
  }
  res.status(204).json({
    status: "success",
    data: null,
  });
});

exports.createBanquet = catchAsync(async (req, res, next) => {
  // const {user}=req.user
  // console.log(req.user)
  const {
    name,
    location,
    services,
    description,
    price,
    capacity,
    specialFeature,
    yearOfEstd,
    availability,
    openHours,
    operatingDays,
    type,
    billboard,
  } = req.body;

  // Create new banquet entry
  const newBanquet = await Banquet.create({
    name,
    location,
    services,
    description,
    price,
    capacity,
    specialFeature,
    yearOfEstd,
    availability,
    openHours,
    operatingDays,
    type,
    billboard,
  });

  await User.findByIdAndUpdate(
    req.user._id,
    { $push: { "post.Banquet": { $each: [newBanquet._id], $position: 0 } } },
    { new: true } // Return the updated document
  );
  // Send response
  res.status(201).json({
    status: "success",
    data: {
      banquet: newBanquet,
    },
  });
});

exports.locationUrl = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { locationUrl } = req.body;

  if (!locationUrl) {
    return next(new AppError("Location URL is required", 400));
  }

  // Extract latitude and longitude from the URL
  const latMatch = locationUrl.match(/!3d([\d.]+)/);
  const lngMatch = locationUrl.match(/!2d([\d.]+)/);

  if (!latMatch || !lngMatch) {
    return next(new AppError("Invalid location URL", 400)); // Handle invalid URL
  }

  const latitude = parseFloat(latMatch[1]);
  const longitude = parseFloat(lngMatch[1]);

  // Find the banquet by ID and update its coordinates and URL
  const banquet = await Banquet.findByIdAndUpdate(
    id,
    {
      locationUrl: {
        type: 'Point', // Fixed 'Point' as type
        coordinates: [longitude, latitude], // Store as array: [lng, lat]
        url: locationUrl, // Store the original location URL
      },
    },
    { new: true, runValidators: true }
  );

  if (!banquet) {
    return next(new AppError("No banquet found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      banquet,
    },
  });
});


exports.getBanquetsWithinRange = catchAsync(async (req, res, next) => {
  const { distance, latlng } = req.params;
  const [lat, lng] = latlng.split(",").map(Number); // Convert to numbers

  console.log(lat, lng, "Coordinates");

  // Convert distance to radius in kilometers
  const radius = distance / 6378.1; // Convert distance to radius in radians

  if (!lat || !lng) {
    return next(
      new AppError(
        "Please provide latitude and longitude in the format lat,lng",
        400
      )
    );
  }

  // Find banquets within the specified radius
  const banquets = await Banquet.find({
    locationUrl: { // Adjusted to match the updated schema
      $geoWithin: {
        $centerSphere: [[lng, lat], radius], // Use [lng, lat] for coordinates
      },
    },
  });

  res.status(200).json({
    status: "success",
    results: banquets.length,
    data: {
      data: banquets,
    },
  });
});


// exports.addNewFolder = catchAsync(async (req, res, next) => {
//   const { id } = req.params;
//   const { name } = req.body;
//   console.log('Uploaded files:', req.files);

//   if (!name) {
//     return next(new AppError('New gallery folder must have a name', 400));
//   }

//   // Find the banquet by ID
//   const banquet = await Banquet.findById(id);
//   if (!banquet) {
//     return next(new AppError('No banquet found with that ID', 404));
//   }

//   // Ensure there are files uploaded
//   if (!req.files || !req.files['photos[]'] || req.files['photos[]'].length === 0) {
//     return next(new AppError('You must upload at least one photo', 400));
//   }

//   // Prepare files for uploading to S3
//   const files = req.files['photos[]'].map(file => ({
//     filename: `banquet-${id}-${file.originalname}`, // Keep the original file name
//     buffer: file.buffer, // Buffer data
//     ContentType: file.mimetype // Content type
//   }));

//   // Upload files to S3
//   const photoUrls = await uploadMultipleFiles(files,`dream-wedding/images/banquet/media/${id}`);

//   // Create a new gallery folder object with S3 URLs
//   const newGalleryFolder = {
//     name,
//     photos: photoUrls, // Use the URLs returned from S3
//   };

//   // Add the new gallery folder to the banquet
//   banquet.gallery.push(newGalleryFolder);

//   // Save the updated banquet
//   const updatedBanquet = await banquet.save({ validateBeforeSave: true });

//   // Respond with the updated banquet
//   res.status(201).json({
//     status: 'success',
//     data: {
//       banquet: updatedBanquet,
//     },
//   });
// });

// exports.patchFolder = catchAsync(async (req, res, next) => {
//   const { id, folderid } = req.params;
//   const { deleteImageArray } = req.body; // Extract deleteImageArray from request body

//   const banquet = await Banquet.findById(id);

//   if (!banquet) {
//     return new NextResponse("Banquet not found", { status: 404 });
//   }

//   // Find the gallery in one go and check if it exists
//   const gallery = banquet.gallery.find((item) => item._id.toString() === folderid);

//   if (!gallery) {
//     return new NextResponse("Gallery not found", { status: 404 });
//   }
//   const extractPart = (array) => {
//     return array.map(url => {
//       // Extract the part after the first occurrence of ".com/"
//       const key = url.split('.com/')[1];
//       return key ? key : ''; // Return the extracted key or an empty string if not found
//     });
//   };

//   const DeleteFolderImages = extractPart(deleteImageArray);
//   console.log(DeleteFolderImages, "Ssfsfsf");

//   if (DeleteFolderImages && DeleteFolderImages.length > 0) {

//     await deleteMultipleFiles(DeleteFolderImages, `dream-wedding`); // Only pass the key prefix, not the bucket name

//     gallery.photos = gallery.photos.filter(photo => !deleteImageArray.includes(photo));
//   }

//   // Step 1: Upload new images to S3
//   if (req.files && req.files['addImagesArray[]']) {
//     const files = req.files['addImagesArray[]'].map((file) => ({
//       filename: `banquet-${id}-${file.originalname}`, // Use the original name of the file
//       buffer: file.buffer, // The buffer containing file data
//       ContentType: file.mimetype, // Content type of the file
//     }));

//     // Upload files and get the uploaded URLs
//     const uploadedUrls = await uploadMultipleFiles(files, `dream-wedding/images/banquet/media/${id}`); // Use the correct path for the object key
//     console.log(uploadedUrls,"upoaded urls")
//     gallery.photos.push(...uploadedUrls);
//   }

//   await banquet.save();
//   res.status(200).json({
//     status: "success",
//     data: {
//       banquet,
//     },
//   });
// });
