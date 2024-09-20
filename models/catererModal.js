const mongoose = require("mongoose");
const { Schema } = mongoose; 

const catererSchema = new Schema({
  name: {
    type: String,
    lowercase: true,
    required: [true, "Name is required!"],
    maxlength: 40,
  },
  description: String,
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
  contactUs: Number,
  yearOfEstd: Number,
  billboard: {
    type: String,
    maxlength: 255,
  },

  photos: {
    type: [String],
    default: [],
  },

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
});

const Caterer = mongoose.model("Caterer", catererSchema);
module.exports = Caterer;
