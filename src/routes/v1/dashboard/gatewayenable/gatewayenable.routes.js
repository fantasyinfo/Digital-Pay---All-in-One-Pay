import express from "express";
import { methodNotAllowed } from "../../../../middlewares/methodNotAllowedMiddleware.js";
import { enableGateway,getAllEnabledGateway } from "../../../../controllers/dashboard/enablegateway/dashboard.enablegateway.controller.js";
import { validateSubscription } from "../../../../middlewares/checkActiveSubscriptionMiddleware.js";

const gatewayEnableRouter = express.Router();

gatewayEnableRouter
  .route("/enable-gateway")
  .post(validateSubscription, enableGateway)
  .all(methodNotAllowed);

  gatewayEnableRouter
  .route("/get-already-enable-gateway-settings")
  .get(validateSubscription, getAllEnabledGateway)
  .all(methodNotAllowed);
export default gatewayEnableRouter;
