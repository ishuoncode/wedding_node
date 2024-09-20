const mongoose = require('mongoose');

const catererSchema = new mongoose.Schema({
    name: {
      type: String,
      lowercase: true,
      required: [true, "Name is required!"],
      maxlength: 40,
    },
  
    price: Number,
    
  
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


const Caterer = mongoose.model('Caterer', catererSchema);
module.exports = Caterer;
