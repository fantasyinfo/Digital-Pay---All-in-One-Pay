import express from "express";
import {
  registerUser,
  loginUser,
  verifyOTP,
  resendOTP,
  sendPasswordResetOTP,
  resetPassword,
  googleSignIn,
} from "../../../controllers/auth/authController.js";
import { verifyToken } from "../../../middlewares/verifyTokenMiddleware.js";
import { methodNotAllowed } from "../../../middlewares/methodNotAllowedMiddleware.js";
import passport from "passport";

const authRouter = express.Router();

// google login
authRouter
  .route("/google-sign-in")
  .get(
    passport.authenticate("google", {
      scope: ["profile", "email"],
    })
  )
  .all(methodNotAllowed);



authRouter.get(
  "/google-sign-in/callback",
  passport.authenticate("google", {
    failureRedirect:
      process.env.CURRENT_MODE === "production"
        ? `${process.env.FRONT_LIVE_URL}/sign-in`
        : `${process.env.FRONT_LOCAL_URL}/sign-in`,
  }),
  googleSignIn
);

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
