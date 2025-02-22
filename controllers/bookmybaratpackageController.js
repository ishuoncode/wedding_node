const BookMyBaratPackage = require("../models/bookmybaratPackageModel");
const catchAsync = require("../utils/catchAsync");
// const { uploadMultipleFiles } = require("./awsController");


exports.createPackage = catchAsync(async (req, res) => {

    const {name,description,basePrice,inclusions,addons} = req.body

    if (!name || !basePrice || !inclusions || !addons) {
      return res.status(400).json({ message: "All required fields must be provided" });
    }
      
    const response = await BookMyBaratPackage.create({name,description,basePrice,inclusions,addons});

    // if(response && Array.isArray(gallery) && gallery.length>0){
    //   const category = "BaratPackage"
    //   const files = req.files["gallery[]"].map((file) => ({
    //     filename: `${category.toLowerCase()}-${response._id}-${file.originalname}`, // Dynamically generate filename
    //     buffer: file.buffer, // Buffer data
    //     ContentType: file.mimetype, // Content type
    //   }));

      const photoUrls = await uploadMultipleFiles(
        files,
        `dream-wedding/images/${category.toLowerCase()}/media/${id}`
      );
    //   response.gallery=photoUrls
    // }
    // await  response.save()
     
    res.status(201).json({
      message: "success",
      data: response,
    });
  } 
);

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
