const mongoose = require("mongoose");
const { Schema } = mongoose;

const analyticsSchema = new Schema({
  eventType: {
    type: String,
    required: true,
    enum: ["Banquet", "Decorator", "Caterer", "Photographer"],
    unique:true
  },
  views: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Analytics = mongoose.model("Analytics", analyticsSchema);
module.exports = Analytics;
