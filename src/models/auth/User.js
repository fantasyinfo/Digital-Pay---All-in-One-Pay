import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const { Schema } = mongoose;

// Define user schema
const userSchema = new Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  dob: { type: Date },
  phone: { type: String },
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
    required: true,
    validate: {
      validator: function (v) {
        // Password regex: at least 1 uppercase, 1 lowercase, 1 number, 1 special character, min 8 characters
        return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(v);
      },
      message: props => `${props.value} is not a valid password. Must have at least 1 uppercase, 1 lowercase, 1 number, 1 special character, and be at least 8 characters long.`
    }
  },
  accessToken: { type: String },
  refreshToken: { type: String },
  otp: { type: String },
  otpExpiresAt: { type: Date },
  isOTPVerified:{type: Boolean, default:false},
  resetPasswordOTP:{ type: String },
  resetPasswordExpires:{ type: Date },
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

const User = mongoose.model('User', userSchema);

export default User;
