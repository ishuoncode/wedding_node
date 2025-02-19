const mongoose = require("mongoose");
const { Schema } = mongoose;

const PackageSchema = new Schema({
  name: {
    type: String,
    enum: ["Maharaja Barat", "Royal Barat", "Elite Barat"],
    required: true,
    unique: true,
  },
  description: {
    type: String,
  },
  basePrice: {
    type: Number,
    required: true,
  },
  inclusions: [
    {
      type: String,
      required: true,
    },
  ],
  popular: {
    type:Boolean,
    
  },
  addons: [
    {
      name: {
        type: String,
        required: true,
      },
      price: {
        type: Number,
        required: true,
      },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Pre-save hook for updatedAt
PackageSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

const BookMyBaratPackage = mongoose.model("BookMyBaratPackage", PackageSchema);
module.exports = BookMyBaratPackage;
