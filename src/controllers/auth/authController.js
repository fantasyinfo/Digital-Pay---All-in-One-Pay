// src/controllers/authController.js

import User from "../../models/auth/User.js";
import { responseHandler } from "../../utils/responseHandler.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { transporter } from "../../utils/nodeMailer.js";
import { validateBody } from "../../utils/functionsUtil.js";

const JWT_SECRET = process.env.JWT_SECRET;

export const registerUser = async (req, res) => {
  const requiredValues = ["firstName", "lastName", "email", "password"];
  const isValid = validateBody(req.body, requiredValues, res);
  if (!isValid) {
    return;
  }

  try {
    const { firstName, lastName, email, password } = req.body;

    // Generate OTP
    const otp = generateOTP();

    const otpExpiresAt = new Date();
    otpExpiresAt.setMinutes(otpExpiresAt.getMinutes() + 10);
    // Save OTP and user details to database
    const newUser = new User({
      firstName,
      lastName,
      email,
      password,
      otp,
      otpExpiresAt: otpExpiresAt,
      isOTPVerified: false,
    });

    await newUser.save();

    // Send email with OTP
    const mailOptions = {
      from: "fantasyinfo.php@gmail.com",
      to: newUser.email,
      subject: "OTP Verification",
      text: `Your OTP for registration is ${otp}.`,
    };

    await transporter.sendMail(mailOptions);

    return responseHandler.success(
      res,
      { email: newUser.email },
      "User registered successfully. Check your email for OTP."
    );
  } catch (error) {
    return responseHandler.error(res, error, "Failed to register user.");
  }
};

// Login user after OTP verification
export const loginUser = async (req, res) => {
  const requiredValues = ["email", "password"];
  const isValid = validateBody(req.body, requiredValues, res);
  if (!isValid) {
    return;
  }

  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return responseHandler.customError(
        res,
        "User not found.",
        "User details not found",
        404
      );
    }

    // Check if OTP is verified
    if (!user.isOTPVerified) {
      return responseHandler.customError(
        res,
        "User Registerd, but OTP not verified.",
        "OTP Verification Required",
        403
      );
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return responseHandler.customError(
        res,
        "User Login Details Not Mached",
        "Incorrect Credentials Login Details",
        401
      );
    }

    // Generate JWT tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

   return  responseHandler.success(
      res,
      { accessToken, refreshToken },
      "Login successful."
    );
  } catch (error) {
    return responseHandler.error(res, error, "Failed to login.");
  }
};

// Verify OTP for account activation
export const verifyOTP = async (req, res) => {
  const requiredValues = ["otp", "email"];
  const isValid = validateBody(req.body, requiredValues, res);
  if (!isValid) {
    return;
  }
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return responseHandler.customError(
        res,
        "User not found.",
        "User details not found",
        404
      );
    
    }
    if (user.otp !== otp) {
      return responseHandler.customError(
        res,
        "OTP Not Valid.",
        "Please add valid otp",
        403
      );

    }
    const now = new Date();
    if (now > user.otpExpiresAt) {
      return responseHandler.customError(
        res,
        "OTP Expired",
        "OTP Time is expired regenrate new otp.",
        401
      );
    }

    // Update user status
    user.isOTPVerified = true;
    user.otp = "";
    user.otpExpiresAt = undefined;
    await user.save();

    return responseHandler.success(
      res,
      { email: user.email },
      "OTP verified successfully."
    );
  } catch (error) {
    return responseHandler.error(res, error, "Failed to verify OTP.");
  }
};

// Resend OTP for user registration
export const resendOTP = async (req, res) => {
  const requiredValues = ['email'];
  const isValid = validateBody(req.body, requiredValues, res);
  if (!isValid) {
    return;
  }

  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return responseHandler.customError(
        res,
        'User not found.',
        'User details not found',
        404
      );
    }

    // Generate new OTP
    const otp = generateOTP();

    // Update OTP and OTP expiration in user document
    user.otp = otp;
    user.otpExpiresAt = new Date();
    user.otpExpiresAt.setMinutes(user.otpExpiresAt.getMinutes() + 10);
    user.isOTPVerified = false;
    await user.save();

    // Send email with new OTP
    const mailOptions = {
      from: 'fantasyinfo.php@gmail.com',
      to: user.email,
      subject: 'OTP Verification',
      text: `Your new OTP for registration is ${otp}.`,
    };

    await transporter.sendMail(mailOptions);

    return responseHandler.success(
      res,
      { email: user.email },
      'New OTP sent successfully. Check your email.'
    );
  } catch (error) {
    return responseHandler.error(res, error, 'Failed to resend OTP.');
  }
};

// Send OTP for password reset
export const sendPasswordResetOTP = async (req, res) => {
  const requiredValues = ["email"];
  const isValid = validateBody(req.body, requiredValues, res);
  if (!isValid) {
    return;
  }

  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error("User not found.");
    }

    // Generate OTP and set expiry
    const otp = generateOTP();
    user.resetPasswordOTP = otp;
    user.resetPasswordExpires = new Date(Date.now() + 30 * 60 * 1000); // OTP expires in 30 minutes
    await user.save();

    // Send email with OTP for password reset
    const mailOptions = {
      from: "fantasyinfo.php@gmail.com",
      to: user.email,
      subject: "Password Reset OTP",
      text: `Your OTP for password reset is ${otp}.`,
    };

    await transporter.sendMail(mailOptions);

    responseHandler.success(
      res,
      { email: user.email },
      "Password reset OTP sent successfully."
    );
  } catch (error) {
    responseHandler.error(res, error, "Failed to send password reset OTP.");
  }
};

// Reset password using OTP
export const resetPassword = async (req, res) => {
  const requiredValues = ["email", "otp", "newPassword"];
  const isValid = validateBody(req.body, requiredValues, res);
  if (!isValid) {
    return;
  }

  try {
    const { email, otp, newPassword } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error("User not found.");
    }
    if (user.resetPasswordOTP !== otp) {
      throw new Error("Invalid OTP.");
    }
    const now = new Date();
    if (now > user.resetPasswordExpires) {
      throw new Error("OTP expired.");
    }

    // Update password
    const hashedPassword = await bcrypt.hash(newPassword, 10); // Hash new password
    user.password = hashedPassword;
    user.resetPasswordOTP = "";
    user.resetPasswordExpires = undefined;
    await user.save();

    responseHandler.success(
      res,
      { email: user.email },
      "Password updated successfully."
    );
  } catch (error) {
    responseHandler.error(res, error, "Failed to update password.");
  }
};

// Generate OTP function
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Generate access token function
function generateAccessToken(user) {
  return jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: "1h" });
}

// Generate refresh token function
function generateRefreshToken(user) {
  return jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: "7d" });
}

// Verify JWT token function (middleware)
export const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return responseHandler.error(
      res,
      null,
      "Unauthorized - Missing token.",
      401
    );
  }
  const token = authHeader.split(" ")[1];
  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return responseHandler.error(
        res,
        err,
        "Unauthorized - Invalid token.",
        401
      );
    }
    req.userId = decoded.userId;
    next();
  });
};
