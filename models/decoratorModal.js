const mongoose = require('mongoose');
const { Schema } = mongoose;
const Review =  require("./review");
// const User = require('./userModal');

const decoratorSchema = new Schema({
  name: {
    type: String,
    lowercase: true,
    required: [true, 'Name is required!'],
    maxlength: 40,
  },
  description: String,
  rating: {
    type: Number,
    required: true,
    default: 4.5,
    min: 1,
    max: 5,
    set: val => Math.round(val * 10) / 10 
  },
  adminRating: {
    type: Number,
    select: false,
    min: 1,
    max: 5,
    set: val => Math.round(val * 10) / 10 
  },
  location: { city: String, pincode: String, area: String },

  price: [Number],
  like: [
    {
      type: Schema.Types.ObjectId,
      ref: 'User', 
    },
  ],
  contactUs :{
    type: Number,
    },
  yearOfEstd: Number,

  reviews: [Review.schema],
  billboard: {
    type: String,
    maxlength: 255,
  },

  photos: {
    type: [String],
    default: [],
  },
  gallery: [
    {
      name: String,
      photos: [String],
    },
  ],
});

const Decorator = mongoose.model('Decorator', decoratorSchema);
module.exports = Decorator;
