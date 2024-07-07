import { validateHeaders } from "../utils/functionsUtil.js";
import { responseHandler } from "../utils/responseHandler.js";
import {
  APIstatusCodes,
  PaymentGatewayCode,
  PaymentGateways,
} from "../utils/constants.js";

export const validPaymentType = (req, res, next) => {
  const requiredValues = ["x-payment-method"];
  const isValid = validateHeaders(req.headers, requiredValues, res, req);
  if (!isValid) {
    return;
  }

  const paymentMethodHeader = req.headers["x-payment-method"];

  if (
    paymentMethodHeader &&
    Object.keys(PaymentGatewayCode).includes(paymentMethodHeader)
  ) {
    const paymentGateway =
      PaymentGatewayCode[paymentMethodHeader].toLowerCase();
    req.paymentMethod = PaymentGateways[paymentGateway];
    next();
  } else {
    return responseHandler.customError(
      req,
      res,
      "errorMessages.gateway.gatewayNotAllowed",
      "errorMessages.gateway.gatewayNotAllowed",
      APIstatusCodes[401]
    );
  }
};
