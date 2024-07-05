import express from "express";
import { methodNotAllowed } from "../../../../middlewares/methodNotAllowedMiddleware.js";
import { responseHandler } from "../../../../utils/responseHandler.js";

import {
  paypal_callBack,
  paypal_cancelBack,
} from "../../../../controllers/callback/paypal/callback.paypal.controller.js";
import {
  stripe_callBack,
  stripe_cancelBack,
} from "../../../../controllers/callback/stripe/callback.stripe.controller.js";

const callbackRouter = express.Router();

const callBackControllers = {
  paypal: paypal_callBack,
  stripe: stripe_callBack,
};
const cancelBackControllers = {
  paypal: paypal_cancelBack,
  stripe: stripe_cancelBack,
};

// callback response
callbackRouter
  .route("/return")
  .get((req, res) => _callBack(req, res))
  .all(methodNotAllowed);

callbackRouter
  .route("/cancel")
  .get((req, res) => _cancelBack(req, res))
  .all(methodNotAllowed);
// callback

const _callBack = (req, res) => {
  const method = req.query.method;
  const controller = callBackControllers[method];

  if (controller) {
    controller(req, res);
  } else {
    return responseHandler.customError(
      req,
      res,
      "errorMessages.gateway.gatewayNotAllowed",
      "errorMessages.gateway.gatewayNotAllowed",
      APIstatusCodes[402]
    );
  }
};

const _cancelBack = (req, res) => {
  const method = req.query.method;
  const controller = cancelBackControllers[method];

  if (controller) {
    controller(req, res);
  } else {
    return responseHandler.customError(
      req,
      res,
      "errorMessages.gateway.gatewayNotAllowed",
      "errorMessages.gateway.gatewayNotAllowed",
      APIstatusCodes[402]
    );
  }
};
export default callbackRouter;
