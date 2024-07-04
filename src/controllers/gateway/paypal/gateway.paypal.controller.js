import { ApiKeysLive, ApiKeysSandbox,CallBackUrl } from "../../../utils/apiKeys.js";
import {
  Modes,
  PaymentGateways,
  PaymentStatus,
  __company
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
import PaymentResponse from '../../../utils/paymentResponse.js'



export const paypal_createPayment = async (req, res) => {
  const _body = req.body;
  const _headers = req.headers;
  const mode = req.mode;
  const userId = req.userId;

  let $paypalClientID = "";
  let $paypalSecretKey = "";
  let $paypalURL = "";
  let _credentialsUsed = __company.name;

  if (mode === Modes.sandbox) {
    // check if client send their paypal sandbox details else use own
    if (
      _body.paypal_sandbox_client_id &&
      _body.paypal_sandbox_secret_key &&
      _body.paypal_sandbox_client_id !== undefined &&
      _body.paypal_sandbox_secret_key !== undefined &&
      _body.paypal_sandbox_client_id !== "" &&
      _body.paypal_sandbox_secret_key !== "undefined"
    ) {
      $paypalClientID = _body.paypal_sandbox_client_id;
      $paypalSecretKey = _body.paypal_sandbox_secret_key;
      $paypalURL = ApiKeysSandbox[PaymentGateways.paypal].url;
      _credentialsUsed = __company.client;
    } else {
      $paypalClientID = ApiKeysSandbox[PaymentGateways.paypal].clientId;
      $paypalSecretKey = ApiKeysSandbox[PaymentGateways.paypal].secretKey;
      $paypalURL = ApiKeysSandbox[PaymentGateways.paypal].url;
    }
  } else if (mode === Modes.live) {
    const requiredValues = ["paypal_live_client_id", "paypal_live_secret_key"];
    const isValid = validateBody(_body, requiredValues, res, req);
    if (!isValid) {
      return;
    }

    if (
      _body.paypal_live_client_id &&
      _body.paypal_live_secret_key &&
      _body.paypal_live_client_id !== undefined &&
      _body.paypal_live_secret_key !== undefined &&
      _body.paypal_live_client_id !== "" &&
      _body.paypal_live_secret_key !== "undefined"
    ) {
      $paypalClientID = _body.paypal_live_client_id;
      $paypalSecretKey = _body.paypal_live_secret_key;
      $paypalURL = ApiKeysLive[PaymentGateways.paypal].url;
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
    const authResponse = await axios.post(
      `${$paypalURL}/v1/oauth2/token`,
      "grant_type=client_credentials",
      {
        auth: {
          username: $paypalClientID,
          password: $paypalSecretKey,
        },
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const accessToken = authResponse.data.access_token;

    // check paypal required fields
    const requiredValues = [
      "intent",
      "purchase_units",
      "total_amount",
      "currency",
      "return_url"
    ];
    const isValid = validateBody(_body, requiredValues, res, req);
    if (!isValid) {
      return;
    }

    if (!validate_data(_body.intent, validators.isString)) {
      return responseHandler.error(
        req,
        res,
        `"intent" :  ${_body.intent}`,
        "errorMessages.dataType.string"
      );
    }

    if (!validate_data(_body.purchase_units, validators.isArrayOfObjects)) {
      return responseHandler.error(
        req,
        res,
        `"purchase_units" :  ${_body.purchase_units}`,
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

    if (!validate_data(_body.return_url, validators.isString)) {
      return responseHandler.error(
        req,
        res,
        `"return_url" :  ${_body.return_url}`,
        "errorMessages.dataType.string"
      );
    }


    // orderData
    let orderData = {
      intent: _body.intent,
      purchase_units: _body.purchase_units,
    };

    if (_body.payment_source) {
      orderData.payment_source = _body.payment_source;
      orderData.payment_source.paypal.experience_context.return_url = CallBackUrl.paypal
    }

    // headers
    let headers = {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    };

    if (_headers["PayPal-Request-Id"]) {
      headers["PayPal-Request-Id"] = _headers["PayPal-Request-Id"];
    }

    const gatewayUrl = `${$paypalURL}/v2/checkout/orders`;

    const orderResponse = await axios.post(gatewayUrl, orderData, {
      headers: headers,
    });

    const link = orderResponse?.data?.links?.find(
      (link) => link?.rel === "payer-action"
    );

    // create transaction entry
    const _transactionObj = {
      mode,
      paymentType: PaymentGateways.paypal,
      gatewayUrl,
      returnUrl:_body.return_url,
      headers,
      payload: orderData,
      response: orderResponse?.data,
      successResponse: {},
      failureResponse: {},
      payUrl: link?.href,
      userId,
      transId: orderResponse?.data?.id,
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


    // delete keys from _transaction
    delete _transcationResObj.userId;
    delete _transcationResObj.headers;
    delete _transcationResObj.gatewayUrl;
    delete _transcationResObj.returnUrl;
    delete _transcationResObj._id;


    // return response object

    const _data = new PaymentResponse(link?.href,orderResponse?.data,_transcationResObj);

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

export const paypal_checkStatus = async (req,res) => {
  
  const isValid = validateParams(req.params, ["id"], res, req);
  if (!isValid) {
    return;
  }
  const _transID = req.params.id;

// first check if this id is in our transaction...

  const _isValidId = await Transaction.findOne({transId:_transID});

  if(!_isValidId){
    return responseHandler.customError(
      req,
      res,
      "errorMessages.gateway.notValidTransactionId",
      "errorMessages.gateway.notValidTransactionId"
    );
  }


  const _body = req.body;
  const _headers = req.headers;
  const mode = req.mode;
  const userId = req.userId;

  let $paypalClientID = "";
  let $paypalSecretKey = "";
  let $paypalURL = "";
  let _credentialsUsed = __company.name;

  if (mode === Modes.sandbox) {
    // check if client send their paypal sandbox details else use own
    if (
      _body.paypal_sandbox_client_id &&
      _body.paypal_sandbox_secret_key &&
      _body.paypal_sandbox_client_id !== undefined &&
      _body.paypal_sandbox_secret_key !== undefined &&
      _body.paypal_sandbox_client_id !== "" &&
      _body.paypal_sandbox_secret_key !== "undefined"
    ) {
      $paypalClientID = _body.paypal_sandbox_client_id;
      $paypalSecretKey = _body.paypal_sandbox_secret_key;
      $paypalURL = ApiKeysSandbox[PaymentGateways.paypal].url;
      _credentialsUsed = __company.client;
    } else {
      $paypalClientID = ApiKeysSandbox[PaymentGateways.paypal].clientId;
      $paypalSecretKey = ApiKeysSandbox[PaymentGateways.paypal].secretKey;
      $paypalURL = ApiKeysSandbox[PaymentGateways.paypal].url;
    }
  } else if (mode === Modes.live) {
    const requiredValues = ["paypal_live_client_id", "paypal_live_secret_key"];
    const isValid = validateBody(_body, requiredValues, res, req);
    if (!isValid) {
      return;
    }

    if (
      _body.paypal_live_client_id &&
      _body.paypal_live_secret_key &&
      _body.paypal_live_client_id !== undefined &&
      _body.paypal_live_secret_key !== undefined &&
      _body.paypal_live_client_id !== "" &&
      _body.paypal_live_secret_key !== "undefined"
    ) {
      $paypalClientID = _body.paypal_live_client_id;
      $paypalSecretKey = _body.paypal_live_secret_key;
      $paypalURL = ApiKeysLive[PaymentGateways.paypal].url;
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
    const authResponse = await axios.post(
      `${$paypalURL}/v1/oauth2/token`,
      "grant_type=client_credentials",
      {
        auth: {
          username: $paypalClientID,
          password: $paypalSecretKey,
        },
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const accessToken = authResponse.data.access_token;


    // headers
    let headers = {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    };

    if (_headers["PayPal-Request-Id"]) {
      headers["PayPal-Request-Id"] = _headers["PayPal-Request-Id"];
    }

    const gatewayUrl = `${$paypalURL}/v2/checkout/orders/${_transID}`;

    const orderResponse = await axios.get(gatewayUrl, {
      headers: headers,
    });

 
    _isValidId.gatewayStatus = orderResponse?.data?.status
      await _isValidId.save();

    const _transcationResObj = _isValidId.toObject();

    // delete keys from _transaction
    delete _transcationResObj.userId;
    delete _transcationResObj.headers;


    // return response object
    const _data = {
      status: orderResponse?.data?.status,
      data: orderResponse?.data,
      transaction: _transcationResObj,
    };

    return responseHandler.success(
      req,
      res,
      _data,
      "successMessages.gateway.orderStatusFetchedSuccess"
    );
  } catch (error) {
    return responseHandler.error(
      req,
      res,
      error,
      "errorMessages.gateway.orderStatusFetchFailed"
    );
  }
}
