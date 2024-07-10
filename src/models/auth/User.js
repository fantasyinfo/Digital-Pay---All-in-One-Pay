import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { DBtables } from '../../utils/constants.js';

const { Schema } = mongoose;

// Define user schema
const userSchema = new Schema({
  firstName: { type: String, required: false },
  lastName: { type: String, required: false },
  email: { type: String, required: true, unique: true },
  dob: { type: String },
  phone: { type: String },
  role: { type: Number, default: 1 }, // 1 = user
  address: {
    addressLine1: { type: String },
    addressLine2: { type: String },
    city: { type: String },
    district: { type: String },
    state: { type: String },
    country: { type: String },
    pincode: { type: String }
  },
  personalIdentityDetails: {
    panCard: { type: String },
    aadharCard: { type: String },
    drivingLicense: { type: String }
  },
  password: {
    type: String,
    required: function() {
      return this.isModified('password'); // Only require if password is being modified
    }
  },
  googleId: { type: String }, // Google ID field
  isGoogleSignIn: { type: Boolean, default: false }, // Indicates if user signed in via Google
  accessToken: { type: String },
  refreshToken: { type: String },
  otp: { type: String },
  otpExpiresAt: { type: Date },
  isOTPVerified: { type: Boolean, default: false },
  resetPasswordOTP: { type: String },
  resetPasswordExpires: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Hash password before saving to database
userSchema.pre('save', async function(next) {
  const user = this;
  if (!user.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(user.password, salt);
    user.password = hash;
    return next();
  } catch (error) {
    return next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model(DBtables.user, userSchema);

export default User;
