import {
  ApiKeysLive,
  ApiKeysSandbox,
  CallBackUrl,
} from "../../../utils/apiKeys.js";
import {
  Modes,
  PaymentGateways,
  PaymentStatus,
  __company,
} from "../../../utils/constants.js";
import { responseHandler } from "../../../utils/responseHandler.js";
import {
  validateBody,
  validateParams,
  validate_data,
  validators,
} from "../../../utils/functionsUtil.js";
import axios from "axios";
import Transaction from "../../../models/gateway/Transactions.js";
import qs from "qs";
import {PaymentResponse} from "../../../utils/paymentResponse.js";

export const stripe_createPayment = async (req, res) => {
  const _body = req.body;
  const mode = req.mode;
  const userId = req.userId;

  let $stripeClientID = "";
  let $stripeSecretKey = "";
  let $stripeURL = "";
  let _credentialsUsed = __company.name;

  if (mode === Modes.sandbox) {
    if (
      _body.stripe_sandbox_client_id &&
      _body.stripe_sandbox_secret_key &&
      _body.stripe_sandbox_client_id !== undefined &&
      _body.stripe_sandbox_secret_key !== undefined &&
      _body.stripe_sandbox_client_id !== "" &&
      _body.stripe_sandbox_secret_key !== "undefined"
    ) {
      $stripeClientID = _body.stripe_sandbox_client_id;
      $stripeSecretKey = _body.stripe_sandbox_secret_key;
      $stripeURL = ApiKeysSandbox[PaymentGateways.stripe].url;
      _credentialsUsed = __company.client;
    } else {
      $stripeClientID = ApiKeysSandbox[PaymentGateways.stripe].clientId;
      $stripeSecretKey = ApiKeysSandbox[PaymentGateways.stripe].secretKey;
      $stripeURL = ApiKeysSandbox[PaymentGateways.stripe].url;
    }
  } else if (mode === Modes.live) {
    const requiredValues = ["stripe_live_client_id", "stripe_live_secret_key"];
    const isValid = validateBody(_body, requiredValues, res, req);
    if (!isValid) {
      return;
    }

    if (
      _body.stripe_live_client_id &&
      _body.stripe_live_secret_key &&
      _body.stripe_live_client_id !== undefined &&
      _body.stripe_live_secret_key !== undefined &&
      _body.stripe_live_client_id !== "" &&
      _body.stripe_live_secret_key !== "undefined"
    ) {
      $stripeClientID = _body.stripe_live_client_id;
      $stripeSecretKey = _body.stripe_live_secret_key;
      $stripeURL = ApiKeysLive[PaymentGateways.stripe].url;
    } else {
      return responseHandler.customError(
        req,
        res,
        "errorMessages.gateway.gatewayCredientialsRequired",
        "errorMessages.gateway.gatewayCredientialsRequired"
      );
    }
  }

  try {
    const accessToken = $stripeSecretKey;

    // check stripe required fields
    const requiredValues = [
      "line_items",
      "total_amount",
      "currency",
      "return_url",
    ];
    const isValid = validateBody(_body, requiredValues, res, req);
    if (!isValid) {
      return;
    }

    if (!validate_data(_body.line_items, validators.isArrayOfObjects)) {
      return responseHandler.error(
        req,
        res,
        `"line_items" :  ${_body.line_items}`,
        "errorMessages.dataType.arrayOfObject"
      );
    }

    if (!validate_data(_body.total_amount, validators.isString)) {
      return responseHandler.error(
        req,
        res,
        `"total_amount" :  ${_body.total_amount}`,
        "errorMessages.dataType.string"
      );
    }
    if (!validate_data(_body.currency, validators.isString)) {
      return responseHandler.error(
        req,
        res,
        `"currency" :  ${_body.currency}`,
        "errorMessages.dataType.string"
      );
    }

    if (!validate_data(_body.return_url, validators.isURL)) {
      return responseHandler.error(
        req,
        res,
        `"return_url" :  ${_body.return_url}`,
        "errorMessages.dataType.url"
      );
    }

    const lineItems = _body.line_items.map((item) => {
      return {
        "price_data[currency]": item.price_data.currency,
        "price_data[product_data][name]": item.price_data.product_data.name,
        "price_data[unit_amount]": item.price_data.unit_amount,
        quantity: item.quantity,
      };
    });

    // orderData
    // Order data
    const orderData = {
      payment_method_types: ["card"],
      line_items: _body.line_items,
      mode: _body.mode,
      success_url: CallBackUrl.stripe,
      cancel_url: CallBackUrl.stripe,
    };

    // Headers
    const headers = {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/x-www-form-urlencoded",
    };

    const gatewayUrl = `${$stripeURL}/v1/checkout/sessions`;
    const orderResponse = await axios.post(
      gatewayUrl,
      qs.stringify(orderData),
      { headers }
    );

    const responseData = orderResponse.data;

    const _transactionObj = {
      mode,
      paymentType: PaymentGateways.stripe,
      gatewayUrl,
      returnUrl: _body.return_url,
      headers,
      payload: orderData.toString(),
      response: responseData,
      successResponse: {},
      failureResponse: {},
      payUrl: responseData.url,
      userId,
      transId: responseData.id,
      amount: _body.total_amount,
      isSuccess: false,
      isFailed: false,
      currentStatus: PaymentStatus.pending,
      currency: _body.currency,
      description: _body.description || "",
    };

    const _transaction = new Transaction(_transactionObj);
    const _updateTransaction = await _transaction.save();
    const _transcationResObj = _updateTransaction.toObject();

    delete _transcationResObj.userId;
    delete _transcationResObj.headers;
    delete _transcationResObj.gatewayUrl;
    delete _transcationResObj.returnUrl;
    delete _transcationResObj._id;

    // return response object

    const _data = new PaymentResponse(
      responseData.url,
      responseData,
      _transcationResObj
    );

    return responseHandler.success(
      req,
      res,
      _data.getResponse(),
      "successMessages.gateway.orderCreationSuccess"
    );
  } catch (error) {
    return responseHandler.error(
      req,
      res,
      error,
      "errorMessages.gateway.orderCreationFailed"
    );
  }
};
