import express from "express";
import { methodNotAllowed } from "../../../../middlewares/methodNotAllowedMiddleware.js";
import { validPaymentType } from "../../../../middlewares/validPaymentTypeMiddleware.js";
import { paypal_createPayment } from "../../../../controllers/gateway/paypal/gateway.paypal.controller.js";
import { stripe_createPayment } from "../../../../controllers/gateway/stripe/gateway.stripe.controller.js";
import { PaymentGateways } from "../../../../utils/constants.js";
import { responseHandler } from "../../../../utils/responseHandler.js";

const gatewayRouter = express.Router();

const paymentControllers = {
  [PaymentGateways.paypal]: paypal_createPayment,
  [PaymentGateways.stripe]: stripe_createPayment,
};

gatewayRouter
  .route("/init")
  .post(validPaymentType, (req, res) => _init(req.paymentMethod, req, res))
  .all(methodNotAllowed);




  // init
const _init = (method, req, res) => {
  const controller = paymentControllers[method];
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

export default gatewayRouter;
