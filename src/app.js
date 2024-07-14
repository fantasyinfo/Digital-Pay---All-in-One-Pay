// import packages
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import passport from "passport";
import { Strategy } from "passport-google-oauth20";
import session from "express-session";
// i18
import i18nextMiddleware from "i18next-http-middleware";
import i18next from "./utils/i18nextTranslate.js";

// import utils
import { responseHandler } from "./utils/responseHandler.js";

// import middlewares
import { errorMiddleware } from "./middlewares/errorMiddleware.js";

// import routes
import authRouter from "./routes/v1/auth/authRoutes.js";
import apiTokenRouter from "./routes/v1/apiToken/apiTokenRoutes.js";
import { verifyToken } from "./middlewares/verifyTokenMiddleware.js";
import gatewayRouter from "./routes/v1/gateway/init/init.routes.js";
import { validateApiKeys } from "./middlewares/validateApiKeysMiddleware.js";
import callbackRouter from "./routes/v1/gateway/callback/callback.routes.js";
import { googleSignIn } from "./controllers/auth/authController.js";
import superGatewayRouter from "./routes/v1/superDuper/gateway/super.gateway.routes.js";
import { validateSuperDuper } from "./middlewares/superDuperMiddleware.js";
import superPlanRouter from "./routes/v1/superDuper/plan/super.plan.routes.js";

// init dot config
dotenv.config();

// init app
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());
app.use(i18nextMiddleware.handle(i18next));
app.use(
  session({
    secret: process.env.SESSION_SECRET_KEY,
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: process.env.CURRENT_MODE === "production" ? true : false,
    }, //
  })
);
app.use(passport.initialize());
app.use(passport.session());

// Error handling middleware
app.use(errorMiddleware);

// init passport
passport.use(
  new Strategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_SIGN_CALLBACK,
    },
    async (accessToken, refreshToken, profile, cb) => {
      try {
        // Pass the user profile to Passport's callback
        cb(null, profile);
      } catch (err) {
        console.error("Google OAuth Error:", err);
        cb(err); // Pass any errors to Passport
      }
    }
  )
);

passport.serializeUser((user, cb) => cb(null, user));
passport.deserializeUser((user, cb) => cb(null, user));

// Routes for dashboard
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/apiToken", verifyToken, apiTokenRouter);

// gateway routes
app.use("/api/v1/gateway", validateApiKeys, gatewayRouter);

app.use("/api/v1/callback", callbackRouter);

// super duper routs
app.use(
  "/api/v1/admin/superDuper/gateway",
  superGatewayRouter
);
app.use("/api/v1/admin/superDuper/plan", superPlanRouter);

// =========
app.use("/api/v1/gateway", verifyToken, superGatewayRouter);
app.use("/api/v1/plan", verifyToken, superPlanRouter);
app.use("/api/v1/subscription", verifyToken, superPlanRouter);

// Error handling middleware
app.use((err, req, res, next) => {
  responseHandler.error(res, err.message || "Internal Server Error");
});

export default app;
