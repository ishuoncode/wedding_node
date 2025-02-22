const BookMyBaratPackage = require("../models/bookmybaratPackageModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const { uploadMultipleFiles, deleteMultipleFiles } = require("./awsController");
// const { uploadMultipleFiles } = require("./awsController");

exports.createPackage = catchAsync(async (req, res) => {
  const { name, description, basePrice, inclusions, addons } = req.body;

  if (!name || !basePrice || !inclusions || !addons) {
    return res
      .status(400)
      .json({ message: "All required fields must be provided" });
  }

  const response = await BookMyBaratPackage.create({
    name,
    description,
    basePrice,
    inclusions,
    addons,
  });

  res.status(201).json({
    message: "success",
    data: response,
  });
});

exports.addImages = catchAsync(async (req, res) => {
  const { id } = req.params;

  const entity = await BookMyBaratPackage.findById(id);

  if (!entity) {
    return next(new AppError(`No package found with that ID`, 404));
  }
  if (
    !req.files ||
    !req.files["gallery[]"] ||
    req.files["gallery[]"].length === 0
  ) {
    return next(new AppError("You must upload at least one photo", 400));
  }

  const category = "BaratPackage";
  const files = req.files["gallery[]"].map((file) => ({
    filename: `${category.toLowerCase()}-${id}-${file.originalname}`, // Dynamically generate filename
    buffer: file.buffer, // Buffer data
    ContentType: file.mimetype, // Content type
  }));
  const photoUrls = await uploadMultipleFiles(
    files,
    `dream-wedding/images/${category.toLowerCase()}/media/${id}`
  );
  entity.gallery = [...entity.gallery, ...photoUrls];
  const response = await entity.save();
  res.status(201).json({
    status: "success",
    data: response,
  });
});

exports.deleteImages = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { deleteImages } = req.body;

  const entity = await BookMyBaratPackage.findById(id);

  if (!entity) {
    return next(new AppError(`No package found with that ID`, 404));
  }

  if (deleteImages && deleteImages.length > 0) {
    const extractPart = (array) => {
      return array.map((url) => {
        const key = decodeURIComponent(url.split(".com/")[1]); // Extract the part after ".com/"
        return key ? key : ""; // Return the extracted key or an empty string if not found
      });
    };

    const DeleteFolderImages = extractPart(deleteImages);
    console.log(DeleteFolderImages, "Images to delete");

    if (DeleteFolderImages && DeleteFolderImages.length > 0) {
      await deleteMultipleFiles(DeleteFolderImages, `dream-wedding`);
      entity.gallery = entity.gallery.filter(
        (photo) => !deleteImages.includes(photo)
      );
      entity.visibleOnTop = entity.visibleOnTop.filter(
        (photo) => !deleteImages.includes(photo)
      );
    }
  }

  const response = await entity.save();
  res.status(201).json({
    status: "success",
    data: {gallery:response.gallery,visibleOnTop:response.visibleOnTop},
  });
});

exports.visibleImages = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { visibleOnTop } = req.body;

  const entity = await BookMyBaratPackage.findByIdAndUpdate(
    id,
    { visibleOnTop },
    { new: true }
  );
  if (!entity) {
    return next(new AppError(`No package found with that ID`, 404));
  }

  res.status(200).json({
    status: "success",
    data: entity,
  });
});

exports.addVideos = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { videos } = req.body;

  const entity = await BookMyBaratPackage.findById(id);

  if (!entity) {
    return next(new AppError(`No package found with that ID`, 404));
  }

  if (!Array.isArray(videos) || videos.length === 0) {
    return next(
      new AppError(`Either 'videos' is not an array or it is empty`, 400)
    );
  }

  entity.videos = [...entity.videos, ...videos];

  const response = await entity.save();

  res.status(200).json({
    status: "success",
    data: response,
  });
});

exports.deleteVideos = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { deleteVideos } = req.body;
  const entity = await BookMyBaratPackage.findById(id);

  if (!entity) {
    return next(new AppError(`No package found with that ID`, 404));
  }

  if (!Array.isArray(deleteVideos) || deleteVideos.length === 0) {
    return next(
      new AppError(`Either 'Videos' is not an array or it is empty`, 400)
    );
  }

  entity.videos = entity.videos.filter(
    (video) => !deleteVideos.includes(video)
  );
  entity.visibleVideos = entity.visibleVideos.filter(
    (video) => !deleteVideos.includes(video)
  );

  const response = await entity.save();

  res.status(200).json({
    status: "success",
    data: {videos:response.videos , visibleVideos:response.visibleVideos},
  });
});

exports.visibleVideos = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { visibleVideos } = req.body;

  const entity = await BookMyBaratPackage.findByIdAndUpdate(
    id,
    { visibleVideos },
    { new: true }
  );
  if (!entity) {
    return next(new AppError(`No package found with that ID`, 404));
  }

  res.status(200).json({
    status: "success",
    data: entity.visibleVideos,
  });
});

// Get all packages
exports.getAllPackages = async (req, res) => {
  try {
    const packages = await BookMyBaratPackage.find();
    res.status(200).json({
      message: "success",
      length: packages.length,
      data: packages,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a single package by ID
exports.getPackageById = async (req, res) => {
  try {
    const package = await BookMyBaratPackage.findById(req.params.id);
    if (!package) {
      return res.status(404).json({ message: "Package not found" });
    }
    res.status(200).json({ message: "success", data: package });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a package by ID
exports.updatePackage = async (req, res) => {
  try {
    const updatedPackage = await BookMyBaratPackage.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedPackage) {
      return res.status(404).json({ message: "Package not found" });
    }
    res.status(200).json(updatedPackage);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete a package by ID
exports.deletePackage = async (req, res) => {
  try {
    const deletedPackage = await BookMyBaratPackage.findByIdAndDelete(
      req.params.id
    );
    if (!deletedPackage) {
      return res.status(404).json({ message: "Package not found" });
    }
    res.status(200).json({ message: "Package deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
