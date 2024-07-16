// src/controllers/authController.js

import User from "../../models/auth/User.js";
import { responseHandler } from "../../utils/responseHandler.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { transporter } from "../../utils/nodeMailer.js";
import { validateBody } from "../../utils/functionsUtil.js";
import i18next from "../../utils/i18nextTranslate.js";
import { APIstatusCodes, subscriptionStatus } from "../../utils/constants.js";
import { Subscription } from "../../models/plans/Subscription.js";

const JWT_SECRET = process.env.JWT_SECRET;

export const registerUser = async (req, res) => {
  const requiredValues = ["email", "password"];
  const isValid = validateBody(req.body, requiredValues, res, req);
  if (!isValid) {
    return;
  }

  try {
    const { email, password } = req.body;

    // Generate OTP
    const otp = generateOTP();

    const otpExpiresAt = new Date();
    otpExpiresAt.setMinutes(otpExpiresAt.getMinutes() + process.env.OTP_EXPIRE);

    const role = 1; //default to user as of now
    // Save OTP and user details to database
    const newUser = new User({
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



      // Fetch user's current subscription
      const currentSubscription = await Subscription.findOne({
        userId: newUser._id,
        status: subscriptionStatus[0], // Ensure this matches the active status in your constants
      })
        .sort({ endDate: -1 })
        .populate("planId");
  

  
      // Append currentPlan details to responseUser
      const responseUser = {
        _id: newUser?._id,
        firstName: newUser?.firstName,
        lastName: newUser?.lastName,
        email: newUser?.email,
        role: newUser?.role,
        googleId: newUser?.googleId,
        isGoogleSignIn: newUser?.isGoogleSignIn,
        dob: newUser?.dob,
        phone: newUser?.phone,
        address: newUser?.address, // Assuming this is needed on the frontend
        currentPlan: {
          _id: currentSubscription?._id,
          planId: {
            _id: currentSubscription?.planId._id,
            title: currentSubscription?.planId.title,
            description: currentSubscription?.planId.description,
            internationalGateways:
              currentSubscription?.planId.internationalGateways,
            nationalGateways: currentSubscription?.planId.nationalGateways,
            maxDomains: currentSubscription?.planId.maxDomains,
            monthlyPrice: currentSubscription?.planId.monthlyPrice,
            yearlyPrice: currentSubscription?.planId.yearlyPrice,
            popular: currentSubscription?.planId.popular,
            exclusive: currentSubscription?.planId.exclusive,
            features: currentSubscription?.planId.features,
            createdAt: currentSubscription?.planId.createdAt,
            updatedAt: currentSubscription?.planId.updatedAt,
          },
          startDate: currentSubscription?.startDate,
          endDate: currentSubscription?.endDate,
          status: currentSubscription?.status,
          createdAt: currentSubscription?.createdAt,
          updatedAt: currentSubscription?.updatedAt,
        },
        accessToken: generateAccessToken(newUser),
        refreshToken: generateRefreshToken(newUser),
      };
    return responseHandler.success(
      req,
      res,
      responseUser,
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

// google sign in
export const googleSignIn = async (req, res) => {
  const _payload = req.user;
  const googleId = _payload._json.sub;
  const firstName = _payload._json.given_name;
  const lastName = _payload._json.family_name;
  const email = _payload._json.email;
  const otpVerify = _payload._json.email_verified;

  try {
    // console.log("Google Sign-in Payload:", _payload);
    let user = await User.findOne({ googleId });

    // Check if user exists with the same Google ID
    if (!user) {
      // console.log("User not found with Google ID, checking by email...");
      // If no user found with Google ID, check by email
      user = await User.findOne({ email });

      if (!user) {
        // console.log("Creating a new user...");
        // If no user found by email, create a new user
        user = new User({
          firstName,
          lastName,
          email,
          googleId,
          password: generatePassword(), // You may need to adjust this
          isGoogleSignIn: true,
          isOTPVerified: otpVerify,
          role: 1,
        });
        await user.save();
      } else {
        // console.log("Updating user with Google ID...");
        // Update user with Google ID if found by email
        user.googleId = googleId;
        user.isGoogleSignIn = true;
        await user.save();
      }
    } else {
      // console.log("User found with Google ID.");
    }

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Redirect to success URL with tokens
    let redirectUrl =
      process.env.CURRENT_MODE === "production"
        ? process.env.FRONT_LIVE_URL
        : process.env.FRONT_LOCAL_URL;

    redirectUrl += `/google/auth/success?e=${user.email}&a=${accessToken}&r=${refreshToken}`;

    return res.redirect(redirectUrl);
  } catch (error) {
    console.log(error);
    // Redirect to sign-in page in case of error
    return res.redirect(
      process.env.CURRENT_MODE === "production"
        ? `${process.env.FRONT_LIVE_URL}/sign-in`
        : `${process.env.FRONT_LOCAL_URL}/sign-in`
    );
  }
};
// Login user after OTP verification
export const loginUser = async (req, res) => {
  const requiredValues = ["email", "password"];
  const isValid = validateBody(req.body, requiredValues, res, req);
  if (!isValid) {
    return;
  }

  try {
    const { email, password } = req.body;

    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return responseHandler.customError(
        req,
        res,
        "errorMessages.auth.user.userNotFound",
        "errorMessages.auth.user.userDetailsNotMatch",
        404 // Assuming APIstatusCodes[404] is the status code
      );
    }

    // Check password match
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return responseHandler.customError(
        req,
        res,
        "errorMessages.auth.login.detailsNotMatch",
        "errorMessages.auth.login.incorrectDetails",
        401 // Assuming APIstatusCodes[401] is the status code
      );
    }

    // Fetch user's current subscription
    const currentSubscription = await Subscription.findOne({
      userId: user._id,
      status: subscriptionStatus[0], // Ensure this matches the active status in your constants
    })
      .sort({ endDate: -1 })
      .populate("planId");

 

    // Append currentPlan details to responseUser
    const responseUser = {
      _id: user?._id,
      firstName: user?.firstName,
      lastName: user?.lastName,
      email: user?.email,
      role: user?.role,
      googleId: user?.googleId,
      isGoogleSignIn: user?.isGoogleSignIn,
      dob: user?.dob,
      phone: user?.phone,
      address: user?.address, // Assuming this is needed on the frontend
      currentPlan: {
        _id: currentSubscription?._id,
        planId: {
          _id: currentSubscription?.planId._id,
          title: currentSubscription?.planId.title,
          description: currentSubscription?.planId.description,
          internationalGateways:
            currentSubscription?.planId.internationalGateways,
          nationalGateways: currentSubscription?.planId.nationalGateways,
          maxDomains: currentSubscription?.planId.maxDomains,
          monthlyPrice: currentSubscription?.planId.monthlyPrice,
          yearlyPrice: currentSubscription?.planId.yearlyPrice,
          popular: currentSubscription?.planId.popular,
          exclusive: currentSubscription?.planId.exclusive,
          features: currentSubscription?.planId.features,
          createdAt: currentSubscription?.planId.createdAt,
          updatedAt: currentSubscription?.planId.updatedAt,
        },
        startDate: currentSubscription?.startDate,
        endDate: currentSubscription?.endDate,
        status: currentSubscription?.status,
        createdAt: currentSubscription?.createdAt,
        updatedAt: currentSubscription?.updatedAt,
      },
      accessToken: generateAccessToken(user),
      refreshToken: generateRefreshToken(user),
    };

 

    return responseHandler.success(
      req,
      res,
      responseUser,
      "successMessages.auth.login"
    );
  } catch (error) {
    console.error("Error logging in user:", error); // Log detailed error
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
  const isValid = validateBody(req.body, requiredValues, res, req);
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
  const isValid = validateBody(req.body, requiredValues, res, req);
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
  const isValid = validateBody(req.body, requiredValues, res, req);
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
  const isValid = validateBody(req.body, requiredValues, res, req);
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

    user.password = password;
    user.resetPasswordOTP = "";
    user.resetPasswordExpires = undefined;
    await user.save();

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

export const getUser = async (req, res) => {
  const userId = req.userId;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return responseHandler.customError(
        req,
        res,
        "errorMessages.auth.user.userNotFound",
        "errorMessages.auth.user.userDetailsNotMatch",
        APIstatusCodes[404]
      );
    }

      // Fetch user's current subscription
      const currentSubscription = await Subscription.findOne({
        userId: user._id,
        status: subscriptionStatus[0], // Ensure this matches the active status in your constants
      })
        .sort({ endDate: -1 })
        .populate("planId");
  
    
  
      // Append currentPlan details to responseUser
      const responseUser = {
        _id: user?._id,
        firstName: user?.firstName,
        lastName: user?.lastName,
        email: user?.email,
        role: user?.role,
        googleId: user?.googleId,
        isGoogleSignIn: user?.isGoogleSignIn,
        dob: user?.dob,
        phone: user?.phone,
        address: user?.address, // Assuming this is needed on the frontend
        currentPlan: {
          _id: currentSubscription?._id,
          planId: {
            _id: currentSubscription?.planId._id,
            title: currentSubscription?.planId.title,
            description: currentSubscription?.planId.description,
            internationalGateways:
              currentSubscription?.planId.internationalGateways,
            nationalGateways: currentSubscription?.planId.nationalGateways,
            maxDomains: currentSubscription?.planId.maxDomains,
            monthlyPrice: currentSubscription?.planId.monthlyPrice,
            yearlyPrice: currentSubscription?.planId.yearlyPrice,
            popular: currentSubscription?.planId.popular,
            exclusive: currentSubscription?.planId.exclusive,
            features: currentSubscription?.planId.features,
            createdAt: currentSubscription?.planId.createdAt,
            updatedAt: currentSubscription?.planId.updatedAt,
          },
          startDate: currentSubscription?.startDate,
          endDate: currentSubscription?.endDate,
          status: currentSubscription?.status,
          createdAt: currentSubscription?.createdAt,
          updatedAt: currentSubscription?.updatedAt,
        },
        accessToken: generateAccessToken(user),
        refreshToken: generateRefreshToken(user),
      };
    return responseHandler.success(
      req,
      res,
      { responseUser },
      "successMessages.auth.user"
    );
  } catch (error) {
    return responseHandler.error(
      req,
      res,
      error,
      "errorMessages.auth.user.userNotFound"
    );
  }
};
export const updateUser = async (req, res) => {
  const userId = req.userId;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return responseHandler.customError(
        req,
        res,
        "errorMessages.auth.user.userNotFound",
        "errorMessages.auth.user.userDetailsNotMatch",
        APIstatusCodes[404]
      );
    }

    user.firstName = req.body.firstName || "";
    user.lastName = req.body.lastName || "";
    user.companyName = req.body.companyName || "";
    user.dob = req.body.dob || "";
    user.phone = req.body.phone || "";
    user.address = req.body.address;

    await user.save();

      // Fetch user's current subscription
      const currentSubscription = await Subscription.findOne({
        userId: user._id,
        status: subscriptionStatus[0], // Ensure this matches the active status in your constants
      })
        .sort({ endDate: -1 })
        .populate("planId");
  
   
  
      // Append currentPlan details to responseUser
      const responseUser = {
        _id: user?._id,
        firstName: user?.firstName,
        lastName: user?.lastName,
        email: user?.email,
        role: user?.role,
        googleId: user?.googleId,
        isGoogleSignIn: user?.isGoogleSignIn,
        dob: user?.dob,
        phone: user?.phone,
        address: user?.address, // Assuming this is needed on the frontend
        currentPlan: {
          _id: currentSubscription?._id,
          planId: {
            _id: currentSubscription?.planId._id,
            title: currentSubscription?.planId.title,
            description: currentSubscription?.planId.description,
            internationalGateways:
              currentSubscription?.planId.internationalGateways,
            nationalGateways: currentSubscription?.planId.nationalGateways,
            maxDomains: currentSubscription?.planId.maxDomains,
            monthlyPrice: currentSubscription?.planId.monthlyPrice,
            yearlyPrice: currentSubscription?.planId.yearlyPrice,
            popular: currentSubscription?.planId.popular,
            exclusive: currentSubscription?.planId.exclusive,
            features: currentSubscription?.planId.features,
            createdAt: currentSubscription?.planId.createdAt,
            updatedAt: currentSubscription?.planId.updatedAt,
          },
          startDate: currentSubscription?.startDate,
          endDate: currentSubscription?.endDate,
          status: currentSubscription?.status,
          createdAt: currentSubscription?.createdAt,
          updatedAt: currentSubscription?.updatedAt,
        },
        accessToken: generateAccessToken(user),
        refreshToken: generateRefreshToken(user),
      };

    return responseHandler.success(
      req,
      res,
      { responseUser },
      "successMessages.auth.userSave"
    );
  } catch (error) {
    return responseHandler.error(
      req,
      res,
      error,
      "errorMessages.auth.user.userNotSave"
    );
  }
};

// Generate OTP function
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Generate access token function
function generateAccessToken(user) {
  return jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: "1d" });
}

// Generate refresh token function
function generateRefreshToken(user) {
  return jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: "7d" });
}

function generatePassword(length = 8) {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = " ";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  return result;
}
