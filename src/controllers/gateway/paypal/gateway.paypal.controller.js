import { CallBackUrl, CancelBackUrl } from "../../../utils/apiKeys.js";
import {
  PaymentGateways,
  PaymentStatus,
  __company,
} from "../../../utils/constants.js";
import { responseHandler } from "../../../utils/responseHandler.js";
import {
  validateParams,
  getRandomTmpStringId,
} from "../../../utils/functionsUtil.js";
import axios from "axios";
import Transaction from "../../../models/gateway/Transactions.js";
import {
  PaymentResponse,
  StatusResponse,
} from "../../../utils/paymentResponse.js";
import Tmp from "../../../models/gateway/Tmp.js";

export const paypal_createPayment = async (req, res) => {
  const _body = req.body;
  const mode = req.mode;
  const userId = req.userId;
  const gatewayClientId = req.gatewayClientID;
  const gatewaySecretKey = req.gatewaySecretKey;
  const gatewayUrlAPI = req.gatewayURL;

  try {
    const accessToken = await getAccessToken(
      gatewayUrlAPI,
      gatewayClientId,
      gatewaySecretKey
    );

    // create transation...
    const gatewayUrl = `${gatewayUrlAPI}/v2/checkout/orders`;
    const checkOutRes = await checkOutTrans(
      gatewayUrl,
      accessToken,
      mode,
      userId,
      _body,
      req,
      res
    );

    // create response to send...
    const _data = new PaymentResponse(
      checkOutRes.payUrl,
      checkOutRes.orderResponse?.data,
      checkOutRes.initId,
      checkOutRes.gatewayId
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

export const paypal_checkStatus = async (req, res) => {
  const isValid = validateParams(req.params, ["id"], res, req);
  if (!isValid) {
    return;
  }
  const _transID = req.params.id;

  // first check if this id is in our transaction...

  const _isValidId = await Transaction.findOne({ transId: _transID });

  if (!_isValidId) {
    return responseHandler.customError(
      req,
      res,
      "errorMessages.gateway.notValidTransactionId",
      "errorMessages.gateway.notValidTransactionId"
    );
  }

  const gatewayClientId = req.gatewayClientID;
  const gatewaySecretKey = req.gatewaySecretKey;
  const gatewayUrlAPI = req.gatewayURL;

  try {
    const accessToken = await getAccessToken(
      gatewayUrlAPI,
      gatewayClientId,
      gatewaySecretKey
    );

    // headers
    let headers = {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    };

    const gatewayUrl = `${gatewayUrlAPI}/v2/checkout/orders/${_transID}`;

    const orderResponse = await axios.get(gatewayUrl, {
      headers: headers,
    });

    _isValidId.gatewayStatus = orderResponse?.data?.status;
    await _isValidId.save();

    // return response object
    const _data = new StatusResponse(
      orderResponse?.data?.status,
      orderResponse?.data
    );

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
};

const getAccessToken = async (
  gatewayUrlAPI,
  gatewayClientId,
  gatewaySecretKey
) => {
  try {
    const authResponse = await axios.post(
      `${gatewayUrlAPI}/v1/oauth2/token`,
      "grant_type=client_credentials",
      {
        auth: {
          username: gatewayClientId,
          password: gatewaySecretKey,
        },
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );
    return authResponse.data.access_token;
  } catch (error) {
    console.error("Error fetching access token:", error);
    throw error;
  }
};

const createTransactionAndReturn = async (
  mode,
  gatewayUrl,
  payUrl,
  _body,
  headers,
  payload,
  orderResponse,
  userId,
  tmpId
) => {
  try {
    // Create transaction entry object
    const transactionObj = {
      mode,
      paymentType: PaymentGateways.paypal,
      gatewayUrl,
      returnUrl: _body.return_url,
      cancelUrl: _body.cancel_url,
      headers,
      payload,
      response: orderResponse?.data,
      successResponse: {},
      failureResponse: {},
      payUrl,
      userId,
      transId: orderResponse?.data?.id,
      amount: _body.total_amount,
      isSuccess: false,
      isFailed: false,
      currentStatus: PaymentStatus.pending,
      currency: _body.currency,
      description: _body.description || "",
      tmpId,
    };

    // Create and save the transaction
    const transaction = new Transaction(transactionObj);
    const savedTransaction = await transaction.save();
    const transactionResObj = savedTransaction.toObject();

    return transactionResObj;
  } catch (error) {
    console.error("Error creating transaction:", error);
    throw new Error("Failed to create transaction.");
  }
};

const checkOutTrans = async (
  gatewayUrl,
  accessToken,
  mode,
  userId,
  _body,
  req,
  res
) => {
  // create tmp transation for callback & cancel ref
  const tmpId = getRandomTmpStringId();
  const tmptransaction = await Tmp.create({ tmpId });

  // payload
  let payload = generateAndGetPayload(_body, req, res, tmpId);

  // headers
  let headers = {
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
  };

  const orderResponse = await axios.post(gatewayUrl, payload, {
    headers: headers,
  });

  const link = orderResponse?.data?.links?.find(
    (link) => link?.rel === "payer-action"
  );

  const transactions = await createTransactionAndReturn(
    mode,
    gatewayUrl,
    link.href,
    _body,
    headers,
    payload,
    orderResponse,
    userId,
    tmptransaction._id
  );

  const initId = transactions._id.toString();

  return {
    payUrl: link.href,
    orderResponse,
    initId,
    gatewayId: orderResponse?.data?.id,
  };
};

const generateAndGetPayload = (body, req, res, tmpId) => {
  let calculatedTotalAmount = 0;

  const purchase_units = body.orderdata.map((item, index) => {
    const itemTotal = item.price * item.qty;
    calculatedTotalAmount += itemTotal;

    return {
      reference_id: index,
      amount: {
        currency_code: body.currency || "USD",
        value: item.price.toFixed(2),
      },
      // description: item.product_name,
      // quantity: item.qty,
    };
  });

  if (calculatedTotalAmount !== body.total_amount) {
    console.log(
      `Calculated total amount (${calculatedTotalAmount}) does not match provided total amount (${body.total_amount})`
    );

    return responseHandler.customError(
      req,
      res,
      null,
      `Calculated total amount (${calculatedTotalAmount}) does not match provided total amount (${body.total_amount})`,
      400
    );
  }

  const optionalParams = body.optional_params || {};
  const paypalExperienceContext =
    optionalParams.payment_source?.paypal?.experience_context || {};

  let payload = {
    intent: optionalParams.intent || "CAPTURE",
    purchase_units: purchase_units,
    payment_source: {
      paypal: {
        experience_context: {
          payment_method_preference:
            paypalExperienceContext.payment_method_preference ||
            "IMMEDIATE_PAYMENT_REQUIRED",
          brand_name: paypalExperienceContext.brand_name || __company.name,
          locale: paypalExperienceContext.locale || "en-US",
          landing_page: paypalExperienceContext.landing_page || "LOGIN",
          user_action: paypalExperienceContext.user_action || "PAY_NOW",
          return_url: `${CallBackUrl.paypal}&tmpId=${tmpId}`,
          cancel_url: `${CancelBackUrl.paypal}&tmpId=${tmpId}`,
        },
      },
    },
    ...optionalParams, // Spread other optional params if any
  };

  return payload;
};
