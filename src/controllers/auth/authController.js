// src/controllers/authController.js

import User from "../../models/auth/User.js";
import { responseHandler } from "../../utils/responseHandler.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { transporter } from "../../utils/nodeMailer.js";
import { validateBody } from "../../utils/functionsUtil.js";
import i18next from "../../utils/i18nextTranslate.js";
import { APIstatusCodes } from "../../utils/constants.js";

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
    otpExpiresAt.setMinutes(otpExpiresAt.getMinutes() + process.env.OTP_EXPIRE);

    const role = 1; //default to user as of now
    // Save OTP and user details to database
    const newUser = new User({
      firstName,
      lastName,
      email,
      password,
      otp,
      role,
      otpExpiresAt: otpExpiresAt,
      isOTPVerified: false,
    });

    await newUser.save();

    // Send email with OTP
    const mailOptions = {
      from: process.env.SMTP_FROM_EMAIL,
      to: newUser.email,
      subject: i18next.t("emailMessages.auth.register.subject"),
      text: i18next.t("emailMessages.auth.register.body") + otp,
    };

    await transporter.sendMail(mailOptions);

    return responseHandler.success(
      req,
      res,
      { email: newUser.email },
      "successMessages.auth.register"
    );
  } catch (error) {
    return responseHandler.error(
      req,
      res,
      error,
      "errorMessages.auth.register.userRegisterFailed"
    );
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
        req,
        res,
        "errorMessages.auth.user.userNotFound",
        "errorMessages.auth.user.userDetailsNotMatch",
        APIstatusCodes[404]
      );
    }

    // Check if OTP is verified
    if (!user.isOTPVerified) {
      return responseHandler.customError(
        req,
        res,
        "errorMessages.auth.otp.otpNotVerify",
        "errorMessages.auth.otp.otpVerifyRequired",
        APIstatusCodes[403]
      );
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return responseHandler.customError(
        req,
        res,
        "errorMessages.auth.login.detailsNotMatch",
        "errorMessages.auth.login.incorrectDetails",
        APIstatusCodes[401]
      );
    }

    // Generate JWT tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    return responseHandler.success(
      req,
      res,
      { accessToken, refreshToken },
      "successMessages.auth.login"
    );
  } catch (error) {
    return responseHandler.error(
      req,
      res,
      error,
      "errorMessages.auth.login.userLoginFailed"
    );
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
        req,
        res,
        "errorMessages.auth.user.userNotFound",
        "errorMessages.auth.user.userDetailsNotMatch",
        APIstatusCodes[404]
      );
    }
    if (user.otp !== otp) {
      return responseHandler.customError(
        req,
        res,
        "errorMessages.auth.otp.otpNotVerify",
        "errorMessages.auth.otp.otpNotMatched",
        APIstatusCodes[403]
      );
    }
    const now = new Date();
    if (now > user.otpExpiresAt) {
      return responseHandler.customError(
        req,
        res,
        "errorMessages.auth.otp.otpExpired",
        "errorMessages.auth.otp.otpTimeOutRegenerate",
        APIstatusCodes[401]
      );
    }

    // Update user status
    await User.updateOne(
      { email: user.email },
      {
        $set: {
          isOTPVerified: true,
          otp: "",
          otpExpiresAt: undefined,
        },
      }
    );

    return responseHandler.success(
      req,
      res,
      { email: user.email },
      "successMessages.auth.otp"
    );
  } catch (error) {
    return responseHandler.error(
      req,
      res,
      error,
      "errorMessages.auth.otp.otpVerifyFailed"
    );
  }
};

// Resend OTP for user registration
export const resendOTP = async (req, res) => {
  const requiredValues = ["email"];
  const isValid = validateBody(req.body, requiredValues, res);
  if (!isValid) {
    return;
  }

  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return responseHandler.customError(
        req,
        res,
        "errorMessages.auth.user.userNotFound",
        "errorMessages.auth.user.userDetailsNotMatch",
        APIstatusCodes[404]
      );
    }

    // Generate new OTP
    const otp = generateOTP();

    // Update OTP and OTP expiration in user document

    const otpExpiresAt = new Date();
    otpExpiresAt.setMinutes(
      user.otpExpiresAt.getMinutes() + process.env.OTP_EXPIRE
    );

    await User.updateOne(
      { email: user.email },
      {
        $set: {
          otp: otp,
          otpExpiresAt: otpExpiresAt,
          isOTPVerified: false,
        },
      }
    );

    // Send email with new OTP
    const mailOptions = {
      from: process.env.SMTP_FROM_EMAIL,
      to: user.email,
      subject: i18next.t("emailMessages.auth.resentOTP.subject"),
      text: i18next.t("emailMessages.auth.resentOTP.body") + otp,
    };

    await transporter.sendMail(mailOptions);

    return responseHandler.success(
      req,
      res,
      { email: user.email },
      "successMessages.auth.otpSend"
    );
  } catch (error) {
    return responseHandler.error(
      req,
      res,
      error,
      "errorMessages.otp.otpSendFail"
    );
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
      return responseHandler.customError(
        req,
        res,
        "errorMessages.auth.user.userNotFound",
        "errorMessages.auth.user.userDetailsNotMatch",
        APIstatusCodes[404]
      );
    }

    // Generate OTP and set expiry
    const otp = generateOTP();
    const otpExpiresAt = new Date();
    otpExpiresAt.setMinutes(otpExpiresAt.getMinutes() + process.env.OTP_EXPIRE);

    await User.updateOne(
      { email: user.email },
      {
        $set: {
          resetPasswordOTP: otp,
          resetPasswordExpires: otpExpiresAt,
        },
      }
    );

    // Send email with OTP for password reset
    const mailOptions = {
      from: process.env.SMTP_FROM_EMAIL,
      to: user.email,
      subject: i18next.t("emailMessages.auth.passwordSet.subject"),
      text: i18next.t("emailMessages.auth.passwordSet.body") + otp,
    };

    await transporter.sendMail(mailOptions);

    return responseHandler.success(
      req,
      res,
      { email: user.email },
      "successMessages.auth.passwordRestOtpSend"
    );
  } catch (error) {
    return responseHandler.error(
      req,
      res,
      error,
      "errorMessages.auth.otp.passwordResetOtp"
    );
  }
};

// Reset password using OTP
export const resetPassword = async (req, res) => {
  const requiredValues = ["email", "otp", "password"];
  const isValid = validateBody(req.body, requiredValues, res);
  if (!isValid) {
    return;
  }

  try {
    const { email, otp, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return responseHandler.customError(
        req,
        res,
        "errorMessages.auth.user.userNotFound",
        "errorMessages.auth.user.userDetailsNotMatch",
        APIstatusCodes[404]
      );
    }
    if (user.resetPasswordOTP !== otp) {
      return responseHandler.customError(
        req,
        res,
        "errorMessages.auth.otp.otpVerifyFailed",
        "errorMessages.auth.otp.otpNotMatched",
        APIstatusCodes[403]
      );
    }
    const now = new Date();
    if (now > user.resetPasswordExpires) {
      return responseHandler.customError(
        req,
        res,
        "errorMessages.auth.otp.otpExpired",
        "errorMessages.auth.otp.otpTimeOutRegenerate",
        APIstatusCodes[401]
      );
    }

    await User.updateOne(
      { email: user.email },
      {
        $set: {
          password: password,
          resetPasswordOTP: "",
          resetPasswordExpires: undefined,
        },
      }
    );

    return responseHandler.success(
      req,
      res,
      { email: user.email },
      "successMessages.auth.passwordUpdated"
    );
  } catch (error) {
    return responseHandler.error(
      req,
      res,
      error,
      "errorMessages.auth.password.passwordUpdateFailed"
    );
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
      req,
      res,
      null,
      "token.auth.missingToken",
      APIstatusCodes[401]
    );
  }
  const token = authHeader.split(" ")[1];
  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return responseHandler.error(
        req,
        res,
        err,
        "token.auth.unauthorizeToken",
        APIstatusCodes[401]
      );
    }
    req.userId = decoded.userId;
    next();
  });
};
