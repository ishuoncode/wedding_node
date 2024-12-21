const mongoose = require("mongoose");
const { type } = require("os");
const { Schema } = mongoose;
const reviewSchema = new Schema({
  content: {
    type: String,
    required: [true, "Review content cannot be blank"],
  },
  
  username:{type:String,required:[true,"Reviews username cannot be blank"]},
  userphoto:{type:String},
  rating: {
    type: Number,
    required: [true, "Rating is required"],
    min: 1,
    max: 5,
  },
  tag: { type: String },

  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: [true, "User ID is required"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Review = mongoose.model("Review", reviewSchema);
module.exports = Review;
