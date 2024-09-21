const mongoose = require('mongoose');
const { Schema } = mongoose;
const Review = require('./review'); 

const photographerSchema = new Schema({
  name: {
    type: String,
    lowercase: true,
    required: [true, 'Name is required!'],
    maxlength: 40,
  },
  rating: {
    type: Number,
    required: true,
    default: 4.5,
    min: 1,
    max: 5,
  },
  adminRating: {
    type: Number,
    select: false,
    min: 1,
    max: 5,
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
      ref: 'User', 
    },
  ],
  contactUs: Number,
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
      name: {
        type: String,
        required: true,
      },
      photos: [String],
    },
  ],
  photos: {
    type: [String],
    default: [],
  },
});

const Photographer = mongoose.model('Photographer', photographerSchema);
module.exports = Photographer;
