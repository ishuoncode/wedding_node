const mongoose = require('mongoose');
const argon2 = require('argon2');

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
    required: true,
  },
  bank: {
    type: bankSchema,
    required: true,
  },
});

const governmentInfoSchema = new mongoose.Schema({
    pancard: {
      type: String,
      required: true,
    },
   
    document: {
      type: String, 
      required: true,
    },
  });

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: [true, 'Email already exists!'],
    required: [true, 'Email is required!'],
    match: [/.+\@.+\..+/, 'Please use a valid email address'],
  },

  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: [8, 'Password must be at least 8 characters long'],
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
    enum: ['none', 'pending', 'accepted'],
    default: 'none',
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
  googleLogIn: {
    type: Boolean,
    default: false,
  },
  role: {
    type: String,
    default: 'user',
    required: true,
    enum: ['admin', 'user', 'seller'],
  },
  createdAt: { type: Date, default: Date.now },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await argon2.hash(this.password);
  next();
});

userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();
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
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  // console.log(this.passwordResetToken, { resetToken });
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

const User = mongoose.model('User', userSchema);
module.exports = User;
