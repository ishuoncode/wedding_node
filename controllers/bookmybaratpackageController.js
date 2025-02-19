const BookMyBaratPackage = require("../models/bookmybaratPackageModel");

// Create a new package
exports.createPackage = async (req, res) => {
  try {
    let packages;
    if (Array.isArray(req.body)) {
      // If the input is an array, create multiple packages
      packages = await BookMyBaratPackage.insertMany(req.body, {
        ordered: false,
      });
    } else {
      // If it's a single object, create one package
      const newPackage = new BookMyBaratPackage(req.body);
      packages = [await newPackage.save()];
    }
    res.status(201).json({
      message: "success",
      length: packages.length,
      data: packages,
    });
  } catch (error) {
    if (error.code === 11000) {
      // Handle duplicate key error
      res.status(400).json({
        message:
          "Duplicate package name(s) found. Some packages may not have been created.",
      });
    } else {
      res.status(400).json({ message: error.message });
    }
  }
};

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
