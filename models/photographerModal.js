const mongoose = require("mongoose");
const { Schema } = mongoose;
const Review = require("./review");

const photographerSchema = new Schema({
  name: {
    type: String,
    lowercase: true,
    required: [true, "Name is required!"],
    maxlength: 40,
  },
  rating: {
    type: Number,
    default: 4.5,
    min: 1,
    max: 5,
    set: (val) => Math.round(val * 10) / 10,
  },
  adminRating: {
    type: Number,
    select: false,
    min: 1,
    max: 5,
    set: (val) => Math.round(val * 10) / 10,
  },
  location: {
    city: { type: String, required: true },
    pincode: { type: String, required: true },
    area: String,
  },
  locationUrl: String,
  description: String,
  feature: [String],
  price: {
    type: [Number],
    default: [],
  },
  like: [
    {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  contactUs: {
    type: Number,
    // required: [true, "contactUs is required"],
  },
  whatsApp: {
    type: String,
  },
  yearOfEstd: Number,
  services: [String],
  reviews: [Review.schema], // Using Review schema as a sub-document
  billboard: {
    type: String,
    maxlength: 255,
  },
  occasion: {
    type: String,
    required: true,
  },
  gallery: [
    {
      name: String,
      photos: [String],
    },
  ],
  photos: {
    type: [String],
    default: [],
  },
  createdAt: { type: Date, default: Date.now },
});

const Photographer = mongoose.model("Photographer", photographerSchema);
module.exports = Photographer;
