const mongoose = require('mongoose');


const sellerSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  middleName: { type: String },
  lastName: { type: String, required: true },
  phoneNumber: String,
  email: {
    type: String,
    unique: [true, 'Email already exists!'],
    required: [true, 'Email is required!'],
    match: [/.+\@.+\..+/, 'Please use a valid email address'],
  },
  address: String,
  pincode: Number,
  city: String,
  state: String,
  whatsappNumber: String,

  GSTNO: String,
  bank: {
    name: String,
    account: String,
    ifsc: String,
    holdername: String,
  },

  pancard: String,
  document: String,

  userid: {
    type: Schema.Types.ObjectId,
    ref: User,
    required: true,
    unique: true,
  },
  status: {
    type: String,
    enum: ['Pending', 'Accepted', 'Rejected'],
    default: 'Pending',
  },
  Banquets: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Banquet',
    },
  ],
  Photographers: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Photographer',
    },
  ],
  Decorators: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Decorator',
    },
  ],
  Caterers: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Caterer',
    },
  ],
  createdAt: { type: Date, default: Date.now },
});

const Seller = mongoose.model('Seller', sellerSchema);
module.exports = Seller;
