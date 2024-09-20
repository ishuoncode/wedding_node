const mongoose = require('mongoose');
const { Schema } = mongoose; 


const banquetSchema = new Schema({
  photo: [
    {
      type: String,
      maxlength: 255,
    },
  ],
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
    city: {
      type: String,
      required: [true, 'Location city is required'],
    },
    pincode: {
      type: String,
      required: [true, 'Location pincode is required'],
    },
    area: {
      type: String,
      required: [true, 'Location area is required'],
    },
  },
  locationUrl: {
    type: String,
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
  },
  like: [
    {
      type: Schema.Types.ObjectId,
      ref: 'User', // Reference to the User model
    },
  ],
  capacity: {
    type: Number,
    required: [true, 'Total people handling capacity is required'],
  },
  specialFeature: [String],
  yearOfEstd: {
    type: Number,
    required: [true, 'Year of establishment is required'],
  },
  services: {
    type: [String],
    validate: {
      validator: function (array) {
        return array.length > 0;
      },
      message: 'At least one service is required',
    },
  },
  type: {
    type: String,
    enum: ['AC', 'Non-AC'],
    default: 'AC',
  },
  availability: {
    type: [String],
    validate: {
      validator: function (array) {
        return array.length > 0;
      },
      message: 'At least one availability is required',
    },
  },
  // reviews: [Review.schema], // Uncomment this if you have a Review model/schema
  billboard: {
    type: String,
    maxlength: 255,
  },
  openHours: {
    type: String,
    required: [true, 'Open hours are required!'],
  },
  operatingDays: {
    type: String,
    required: [true, 'Operating days are required'],
    uppercase: true,
  },
  gallery: [
    {
      name: String,
      photos: [String],
    },
  ],
  // createdAt: { type: Date, default: Date.now }, // Uncomment if you want a createdAt field
});

const Banquet = mongoose.model('Banquet', banquetSchema);
module.exports = Banquet;
