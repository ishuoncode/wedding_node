const mongoose = require("mongoose");
const argon2 = require("argon2");
const { randomBytes, createHash } = require("crypto");
const { Schema } = mongoose;

const bankSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  account: {
    type: String,
    required: true,
  },
  reenterAccount: {
    type: String,
    required: true,
  },
  ifsc: {
    type: String,
    required: true,
  },
  holdername: {
    type: String,
    required: true,
  },
});

const personalInfoSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  middleName: {
    type: String,
  },
  lastName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  whatsappNumber: {
    type: String,
  },
  pincode: Number,
  city: String,
  state: String,
});

const importantInfoSchema = new mongoose.Schema({
  GSTNO: {
    type: String,
  },
  bank: {
    type: bankSchema,
    // required: true,
  },
});

const governmentInfoSchema = new mongoose.Schema({
  pancard: {
    type: String,
    required: true,
    minlength: 10,
    maxlength: 10,
    uppercase: true,
  },

  document: {
    type: String,
  },
  allowed: {
    type: [String], // Array of strings
    required: true, // You can make this required if needed
    // enum: ['Banquet', 'Caterer', 'Photographer', 'Decorator'], // Ensure only valid options are stored
  },
});

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: [true, "Email already exists!"],
    required: [true, "Email is required!"],
    match: [/.+\@.+\..+/, "Please use a valid email address"],
  },
  phoneNumber: {
    type: String,
    trim: true, // Trims any leading/trailing whitespace

    // required: [true, "Phone number is required"],
  },
  password: {
    type: String,
    required: [true, "Please provide a password"],
    minlength: [8, "Password must be at least 8 characters long"],
    select: false,
  },
  image: {
    type: String,
  },
  address: String,
  pincode: Number,
  city: String,
  state: String,
  name: {
    type: String,
  },
  sellerRequest: {
    type: String,
    enum: ["none", "pending", "accepted"],
    default: "none",
  },
  draft: {
    personalInfo: {
      type: personalInfoSchema,
      // required: true,
    },
    importantInfo: {
      type: importantInfoSchema,
      // required: true,
    },
    governmentInfo: {
      type: governmentInfoSchema,
      // required: true,
    },
  },
  post: {
    Banquet: {
      type: [{ type: Schema.Types.ObjectId, ref: "Banquet" }],
      default: [],

    },
    Decorator: {
      type: [{ type: Schema.Types.ObjectId, ref: "Decorator" }],
      default: [],
     
    },
    Caterer: {
      type: [{ type: Schema.Types.ObjectId, ref: "Caterer" }],
      default: [],
    
    },
    Photographer: {
      type: [{ type: Schema.Types.ObjectId, ref: "Photographer" }],
      default: [],

    },
  },

  wishlist: {
    Banquet: {
      type: [{ type: Schema.Types.ObjectId, ref: "Banquet" }],
      default: [],
      // unique: true,
    },
    Decorator: {
      type: [{ type: Schema.Types.ObjectId, ref: "Decorator" }],
      default: [],
      // unique: true,
    },
    Caterer: {
      type: [{ type: Schema.Types.ObjectId, ref: "Caterer" }],
      default: [],
      // unique: true,
    },
    Photographer: {
      type: [{ type: Schema.Types.ObjectId, ref: "Photographer" }],
      default: [],
      // unique: true,
    },
  },
  sellerid: {
    type: Schema.Types.ObjectId,
    ref: "Seller",
  },

  googleLogIn: {
    type: Boolean,
    default: false,
  },
  role: {
    type: String,
    default: "user",
    required: true,
    enum: ["admin", "user", "seller"],
  },
  createdAt: { type: Date, default: Date.now },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await argon2.hash(this.password);
  next();
});

userSchema.pre("save", function (next) {
  if (!this.isModified("password") || this.isNew) return next();
  this.passwordChangedAt = Date.now() - 10000;
  next();
});

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await argon2.verify(userPassword, candidatePassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = randomBytes(32).toString("hex");
  this.passwordResetToken = createHash("sha256")
    .update(resetToken)
    .digest("hex");
  // console.log(this.passwordResetToken, { resetToken });
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

const User = mongoose.model("User", userSchema);
module.exports = User;
