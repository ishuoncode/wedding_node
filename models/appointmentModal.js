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
  timeSlot: {
    type: String,
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
  date: {
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
