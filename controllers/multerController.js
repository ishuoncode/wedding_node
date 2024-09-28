const multer = require('multer');
const AppError = require("../utils/appError");

// Use memory storage to handle uploads in memory (instead of disk storage)
const multerStorage = multer.memoryStorage();

// File filter to only accept image files
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Unsupported file type. Please upload images only.', 400), false);
  }
};

// Function to create a dynamic multer upload middleware
const createUploadMiddleware = (fieldName, maxCount) => {
  const upload = multer({ storage: multerStorage, fileFilter: multerFilter });
  return upload.fields([{ name: fieldName, maxCount }]);
};

// Export dynamic upload function for handling images
exports.uploadImages = (fieldName, maxCount = 10) => createUploadMiddleware(fieldName, maxCount);
