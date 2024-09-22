const User = require("../models/userModal");
const Seller = require("../models/sellerModal");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

exports.getAllSellers = catchAsync(async (req, res, next) => {
  const sellers = await Seller.find();
  res.status(200).json({
    status: "success",
    results: sellers.length,
    data: {
      sellers,
    },
  });
});

exports.getMe = catchAsync(async (req, res, next) => {
  const seller = await Seller.findById(req.params.id);
  // console.log("🚀 ~ exports.getMe=catchAsync ~ user:", user)

  if (!seller) {
    return next(new AppError("No seller found with that ID", 404));
  }
  res.status(200).json({
    status: "success",
    data: {
      seller,
    },
  });
});
