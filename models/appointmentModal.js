const mongoose = require("mongoose");
const { Schema } = mongoose;

const appointmentSchema = new Schema({
  categoryName: {
    type: String,
    enum: ["Banquet", "Decorator", "Caterer", "Photographer"],
    required: true,
  },
  categoryId: {
    type: Schema.Types.ObjectId,
    refPath: "categoryName",
    required: true,
  },
  userId:{
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "completed"],
    default: "pending",
  },
  name: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate:{
    type: Date,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Appointment = mongoose.model("Appointment", appointmentSchema);
module.exports = Appointment;
