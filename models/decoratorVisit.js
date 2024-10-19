const mongoose = require("mongoose");
const { Schema } = mongoose;

const decoratorVisitSchema = new Schema({
  decoratorId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Decorator",
  },
  years: {
    type: [
      {
        year: {
          type: String,
        },
        monthlyVisits: {
          type: [
            {
              month: {
                type: String,

                enum: [
                  "January",
                  "February",
                  "March",
                  "April",
                  "May",
                  "June",
                  "July",
                  "August",
                  "September",
                  "October",
                  "November",
                  "December",
                ],
              },
              visits: {
                type: Number,
                default: 0,
              },
            },
          ],
          validate: {
            validator: function (array) {
              return array.length <= 12;
            },
            message:
              "The monthlyVisits array can contain a maximum of 12 items.",
          },
        },
      },
    ],
    validate: {
      validator: function (array) {
        return array.length <= 100; 
      },
      message: "The years array can contain a maximum of 100 years.",
    },
  },
});

const DecoratorVisit = mongoose.model("DecoratorVisit", decoratorVisitSchema);
module.exports = DecoratorVisit;
