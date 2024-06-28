import express from "express";
import {
  registerUser,
  loginUser,
  verifyOTP,
  resendOTP,
  sendPasswordResetOTP,
  resetPassword,
} from "../../../controllers/auth/authController.js";
import { verifyToken } from "../../../middlewares/verifyTokenMiddleware.js";
import { methodNotAllowed } from "../../../middlewares/methodNotAllowedMiddleware.js";

const authRouter = express.Router();

authRouter.route("/register").post(registerUser).all(methodNotAllowed);

authRouter.route("/login").post(loginUser).all(methodNotAllowed);

authRouter.route("/verify-otp").post(verifyOTP).all(methodNotAllowed);

authRouter.route("/resend-otp").post(resendOTP).all(methodNotAllowed);

authRouter
  .route("/password-reset-otp")
  .post(sendPasswordResetOTP)
  .all(methodNotAllowed);

authRouter.route("/password-reset").post(resetPassword).all(methodNotAllowed);

authRouter
  .route("/protected-route")
  .get(verifyToken, (req, res) => {
    res.json({
      message: "Access granted to protected route.",
      userId: req.userId,
    });
  })
  .all(methodNotAllowed);

export default authRouter;
