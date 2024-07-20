import express from "express";
import { methodNotAllowed } from "../../../../middlewares/methodNotAllowedMiddleware.js";
import { enableGateway } from "../../../../controllers/dashboard/enablegateway/dashboard.enablegateway.controller.js";
import { validateSubscription } from "../../../../middlewares/checkActiveSubscriptionMiddleware.js";

const gatewayEnableRouter = express.Router();

gatewayEnableRouter
  .route("/enable-gateway")
  .post(validateSubscription, enableGateway)
  .all(methodNotAllowed);

export default gatewayEnableRouter;
