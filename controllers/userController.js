const User = require("../models/userModal");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const { generatePresignedUrl } = require("./awsController");

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find({ role: { $in: ["user", "seller"] } });
  res.status(200).json({
    status: "success",
    results: users.length,
    data: {
      users,
    },
  });
});

exports.getMe = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  // console.log("🚀 ~ exports.getMe=catchAsync ~ user:", user)

  if (!user) {
    return next(new AppError("No user found with that ID", 404));
  }
  res.status(200).json({
    status: "success",
    data: {
      user,
    },
  });
});

exports.deleteUser = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) {
    return next(new AppError("No document found with that ID", 404));
  }
  res.status(204).json({
    status: "success",
    data: null,
  });
});

exports.presigned = catchAsync(async (req, res, next) => {
  console.log(req.body, "req.body");
  const { content, id } = req.body;
  const ContentType = content;
  const filename = `user-${id}-${Date.now()}`;

  try {
    // Generate the presigned URL using the utility function
    const presignedPUTURL = await generatePresignedUrl(
      filename,
      ContentType,
      "dream-wedding/images/user"
    );

    res.status(200).json({
      status: "success",
      data: {
        presignedPUTURL,
        filename,
      },
    });
  } catch (error) {
    console.error("Error generating presigned URL:", error);
    next(error); // Pass error to the global error handler
  }
});

exports.addProfileImage = catchAsync(async (req, res, next) => {
  const { image } = req.body;
  const baseUrl = `https://dream-wedding.s3.eu-north-1.amazonaws.com/images/user/`;
   const updateImage = `${baseUrl}${image}`
  if (!image) {
    return new AppError("No image provided", 400);
  }
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { image: updateImage },
    { new: true, runValidators: true }
  );
  if (!user) {
    return new AppError("User not found", 404);
  }
  res.status(200).json({
    status: "success",
    data: {
      user,
    },
  });
});
