const mongoose = require('mongoose');
const Review =  require("./review");

const banquetSchema = new mongoose.Schema({
    photo: [
      {
        type: String,
        maxlength: 255,
      },
    ],
    name: {
      type: String,
      lowercase: true,
      required: [true, "Name is required!"],
      maxlength: 40,
    },
    rating: {
      type: Number,
      required: true,
      default: 4.5,
      min: 1,
      max: 5,
    },
    adminRating:{
      type: Number,
      select: false,
      min: 1,
      max: 5
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
    locationUrl: {type:String },
    description:{type:String , required:[true,"Description is required"]},
    price:{type:Number , required:[true,"Price is required"]},
    like: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    capacity:{type:Number , required:[true,"total people Handling Capacity is required"]},
    specialFeature: [String],
    yearOfEstd:  {type:Number , required:[true,"year Of Estd. is required"]},
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
      enum: ["AC", "Non-AC"],
      default: "AC",
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
    reviews: [Review.schema],
    billboard: {
      type: String,
      maxlength: 255,
    },
    openHours: {
      type: String,
      required: [true, "Open Hours is required!"],
      
    },
    operatingDays: {type:String , required:[true,"operatingDays is required" ], uppercase:true},
    gallery: [{name: String, photos: [String]}],
    // createdAt: { type: Date, default: Date.now },
  });

  
const Banquet = mongoose.model('Banquet', banquetSchema);
module.exports = Banquet;