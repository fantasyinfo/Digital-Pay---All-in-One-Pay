import express from "express";
import { methodNotAllowed } from "../../../../middlewares/methodNotAllowedMiddleware.js";
import { validPaymentType } from "../../../../middlewares/validPaymentTypeMiddleware.js";
import {
  paypal_createPayment,
  paypal_checkStatus,
} from "../../../../controllers/gateway/paypal/gateway.paypal.controller.js";
import {
  stripe_checkStatus,
  stripe_createPayment,
} from "../../../../controllers/gateway/stripe/gateway.stripe.controller.js";
import { PaymentGateways } from "../../../../utils/constants.js";
import { responseHandler } from "../../../../utils/responseHandler.js";
import {
  CheckPayloadForInit,
  CheckPayloadForStatus,
} from "../../../../middlewares/validatePayloadMiddleware.js";

const gatewayRouter = express.Router();

const paymentControllers = {
  [PaymentGateways.paypal]: paypal_createPayment,
  [PaymentGateways.stripe]: stripe_createPayment,
};

const paymentStatusControllers = {
  [PaymentGateways.paypal]: paypal_checkStatus,
  [PaymentGateways.stripe]: stripe_checkStatus,
};

// init the payment
gatewayRouter
  .route("/init")
  .post(validPaymentType, CheckPayloadForInit, (req, res) =>
    _init(req.paymentMethod, req, res)
  )
  .all(methodNotAllowed);

// check status of that init payment
gatewayRouter
  .route("/init/:id")
  .get(validPaymentType, CheckPayloadForStatus, (req, res) =>
    _initGet(req.paymentMethod, req, res)
  )
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

const _initGet = (method, req, res) => {
  const controller = paymentStatusControllers[method];
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
