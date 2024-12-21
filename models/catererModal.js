const mongoose = require("mongoose");
const { Schema } = mongoose;
const Review = require("./review");

const sectionSchema = new Schema({
  veg: {
    starter: [String],
    maincourse: [String],
    desert: [String],
    welcomedrink: [String],
    breads: [String],
    rice: [String],
  },
  nonveg: {
    starter: [String],
    maincourse: [String],
    desert: [String],
    welcomedrink: [String],
    breads: [String],
    rice: [String],
  },
  addon: {
    starter: [{ name: String, price: String }],
    maincourse: [{ name: String, price: String }],
    desert: [{ name: String, price: String }],
    welcomedrink: [{ name: String, price: String }],
    breads: [{ name: String, price: String }],
    rice: [{ name: String, price: String }],
  },
  price: {
    type: [Number],
    default: [],
  },
});

const catererSchema = new Schema({
  name: {
    type: String,
    lowercase: true,
    required: [true, "Name is required!"],
    maxlength: 40,
  },
  billboard:[String],
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
  reviews: [Review.schema],
  like: [
    {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  contactUs :{
    type: Number,
    // required: [true, 'contactUs is required'],
    },
    whatsApp:{
      type: String,
    },
  yearOfEstd: Number,
  // billboard: {
  //   type: String,
  //   maxlength: 255,
  // },
  // photos: {
  //   type: [String],
  //   default: [],
  // },
  gallery: [
    {
      name: String,
      photos: [String],
    },
  ],
  basic: sectionSchema,    
  standard: sectionSchema, 
  deluxe: sectionSchema, 
  createdAt: { type: Date, default: Date.now }, 
});

const Caterer = mongoose.model("Caterer", catererSchema);
module.exports = Caterer;
