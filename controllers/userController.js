const User = require("../models/userModal");
const Seller = require("../models/sellerModal");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const { generatePresignedUrl, deleteFile } = require("./awsController");

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

exports.presignedDocs = catchAsync(async (req, res, next) => {
  const { content, id } = req.body;
  const ContentType = content;
  const filename = `seller-${id}-${Date.now()}`;

  try {
    // Generate the presigned URL using the utility function
    const presignedPUTURL = await generatePresignedUrl(
      filename,
      ContentType,
      "dream-wedding/images/seller"
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

  const user = await User.findById(req.params.id).select("image");
  if (!user) {
    return next(new AppError("User not found", 404));
  }
  
  // Delete the existing image if it exists
  if (user.image) {
    const imageUrl = user.image;
    const imageKey = imageUrl.split("/").slice(-1)[0];
  
    await deleteFile(imageKey, "dream-wedding/images/user");
    console.log(`Image ${imageKey} deleted successfully from S3`);
  }
  
  // Check if a new image is provided
  if (!image) {
    return next(new AppError("No image provided", 400));
  }
  
  // Update the image URL
  const baseUrl = `https://dream-wedding.s3.eu-north-1.amazonaws.com/images/user/`;
  const updateImage = `${baseUrl}${image}`;
  
  user.image = updateImage; // Update the image field
  await user.save({ validateBeforeSave: true }); // Save the user with new image
  
  // Send response
  res.status(200).json({
    status: "success",
    data: {
      user,
    },
  });
  
});

exports.updateUser = catchAsync(async (req, res, next) => {
  const { email, phoneNumber, name } = req.body;

  // Find user by ID and update the relevant fields
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { email, phoneNumber, name },
    { new: true, runValidators: true }
  );

  // If no user found, return error
  if (!user) {
    return next(new AppError("No user found with that ID", 404));
  }

  // Send back the updated user details
  res.status(200).json({
    status: "success",
    data: {
      updatedUser: user,
    },
  });
});

exports.sellerDraft = catchAsync(async (req, res, next) => {
  const { draft } = req.query;
  console.log(draft, "draft");
  console.log(req.body);

  // Allowed personal info fields
  const allowedPersonalInfoFields = [
    "firstName",
    "middleName",
    "lastName",
    "email",
    "phoneNumber",
    "address",
    "whatsappNumber",
    "pincode",
    "city",
    "state",
  ];

  // Allowed important info fields
  const allowedImportantInfo = ["GSTNO", "bank"];

  // Allowed government info fields
  const allowedGovtInfo = ["pancard", "allowed"];

  let data = {};

  if (draft === "personalInfo") {
    // Filter req.body to only include allowed personal info fields
    Object.keys(req.body).forEach((key) => {
      if (allowedPersonalInfoFields.includes(key)) {
        data[key] = req.body[key];
      }
    });
  } else if (draft === "importantInfo") {
    Object.keys(req.body).forEach((key) => {
      if (allowedImportantInfo.includes(key)) {
        if (key === "bank") {
          // Handle nested bank fields
          data.bank = {};
          const allowedBankFields = [
            "name",
            "account",
            "reenterAccount",
            "ifsc",
            "holdername",
          ];

          // Filter and include only allowed bank fields
          Object.keys(req.body.bank || {}).forEach((bankKey) => {
            if (allowedBankFields.includes(bankKey)) {
              data.bank[bankKey] = req.body.bank[bankKey];
            }
          });
        } else {
          data[key] = req.body[key];
        }
      }
    });
  } else if (draft === "governmentInfo") {
    // Handle government info fields
    Object.keys(req.body).forEach((key) => {
      if (allowedGovtInfo.includes(key)) {
        data[key] = req.body[key];
      }
    });

    // Additional validation for the allowed field
    if (req.body.allowed) {
      const validOptions = ["Banquet", "Caterer", "Photographer", "Decorator"];
      const selectedOptions = req.body.allowed.filter((option) =>
        validOptions.includes(option)
      );
      if (selectedOptions.length > 0) {
        data.allowed = selectedOptions; // Only store valid options
      } else {
        return next(
          new AppError("No valid options selected for 'allowed'.", 400)
        );
      }
    }
  }

  // Ensure that there is data to update
  if (Object.keys(data).length === 0) {
    return next(new AppError("No valid fields provided.", 400));
  }

  console.log(data, "data");
  // Update the user draft field in the database
  let user

  if (draft === "governmentInfo") {
    // Find the user
    user = await User.findById(req.params.id);
    
    if (!user) {
      return next(new AppError("No user found with that ID.", 404));
    }
  
    // Check if there is an existing governmentInfo document to delete
    if (user.draft.governmentInfo && user.draft.governmentInfo.document) {
      const existingDocument = user.draft.governmentInfo.document;
      console.log(existingDocument, "old document");
      
      try {
        const imageKey = existingDocument.split("/").slice(-1)[0]; // Extract the key
        await deleteFile(imageKey, "dream-wedding/images/seller"); // Delete the existing document from S3
        console.log(`Document ${imageKey} deleted successfully from S3`);
      } catch (error) {
        console.error(`Error deleting document ${imageKey} from S3:`, error);
        return next(new AppError("Failed to delete existing document from S3.", 500));
      }
    }
  
    // Assign the new governmentInfo data
    user.draft.governmentInfo = data;
  
    // Save the user
    await user.save();
  } else {
    // For other drafts, use findByIdAndUpdate
    user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: { [`draft.${draft}`]: data } },
      { new: true, runValidators: true }
    );
  
    if (!user) {
      return next(new AppError("No user found with that ID.", 404));
    }
  }
  
  if (!user) {
    return next(new AppError("No user found with that ID.", 404));
  }

  // Send response
  res.status(200).json({
    status: "success",
    data: user,
  });
});

exports.documentUpdate = catchAsync(async (req, res, next) => {
  // console.log(req.body);
  const { document, draft } = req.body;

  // Check if draft and document are provided
  if (!draft || !document) {
    return next(new AppError("Draft type and document must be provided.", 400));
  }

  // Find the user
  const user = await User.findById(req.params.id);
  if (!user) {
    return next(new AppError("No user found with that ID.", 404));
  }

  // console.log(user,"user")


 

  // Construct the new document URL
  const baseUrl = `https://dream-wedding.s3.eu-north-1.amazonaws.com/images/seller/`;
  const updateDocument = `${baseUrl}${document}`;

  // Update the document in the user's draft
  user.draft[draft].document = updateDocument; // Update the document field
  await user.save({ validateBeforeSave: true }); // Save the user

  // Send response
  res.status(200).json({
    status: "success",
    data: user,
  });
});

exports.sellerRequest = catchAsync(async (req, res, next) => {
  // Fetch user by ID
  // console.log("SdsdsdfsfS")
  
  const user = await User.findById(req.params.id);
  if (!user) {
    return NextResponse.json({ message: "User not found" }, { status: 404 });
  }

  let seller

  if(!user.sellerid){

  
    // Destructure personal, important, and government information
    const {
      firstName,
      middleName,
      lastName,
      email,
      phoneNumber,
      address,
      pincode,
      city,
      state,
      whatsappNumber,
    } = user.draft?.personalInfo || {};
  
    const {
      GSTNO,
      bank = { name: undefined, account: undefined, reenterAccount: undefined, ifsc: undefined, holdername: undefined },
    } = user.draft?.importantInfo || {};
  
    const {
      pancard,
      document,
      allowed,
    } = user.draft?.governmentInfo || {};
  
    // Prepare the data for the Seller model
    const sellerData = {
      firstName,
      middleName,
      lastName,
      email,
      phoneNumber,
      address,
      pincode,
      city,
      state,
      whatsappNumber,
      GSTNO,
      bank: {
        name: bank.name,
        account: bank.account,
        reenterAccount: bank.reenterAccount,
        ifsc: bank.ifsc,
        holdername: bank.holdername,
      },
      pancard,
      document,
      allowed,
      userid: req.params.id,
    };
    // Create the seller record
     seller = await Seller.create(sellerData);
    
      if (!seller) {
        return next(new AppError("Error creating seller record", 500));
      }
      console.log(seller, "seller");

      //Add seller id to user.sellerid
      user.sellerid=seller._id;
    }else{
       await Seller.findByIdAndUpdate(
        user.sellerid,
        { status: "Pending" },
        { new: true } // This option returns the updated document
    );
    }
      
      // Update user status and save in one go
      user.sellerRequest = "pending";
      
      await user.save();
  
  // Send response
  res.status(200).json({
    status: "success",
    message: "Seller request created successfully",
    data: seller,
  });
});
