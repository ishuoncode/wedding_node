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


exports.updateStatus = catchAsync(async (req, res, next) => {
  const { status } = req.body;

  // Update seller status
  const seller = await Seller.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true, runValidators: true }
  );

  // Determine the sellerRequest status based on the condition
  const sellerRequestStatus = status === "Accepted" ? "accepted" : "none";
  const role = status === "Accepted" ? "seller" : "user";

  // Update user's sellerRequest status
  const user = await User.findByIdAndUpdate(
    seller.userid,
    { sellerRequest: sellerRequestStatus,role },
    { new: true, runValidators: true }
  );

  if (!user) {
    return next(new AppError('No user found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      user
    },
  });
});

