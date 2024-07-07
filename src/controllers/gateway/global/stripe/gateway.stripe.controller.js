import {
  ApiKeysLive,
  ApiKeysSandbox,
  CallBackUrl,
  CancelBackUrl,
} from "../../../../utils/apiKeys.js";
import {
  APIstatusCodes,
  PaymentGateways,
  PaymentStatus,
  __company,
} from "../../../../utils/constants.js";
import { responseHandler } from "../../../../utils/responseHandler.js";

import axios from "axios";
import Transaction from "../../../../models/gateway/Transactions.js";
import qs from "qs";
import {
  PaymentResponse,
  StatusResponse,
} from "../../../../utils/paymentResponse.js";
import {
  getRandomTmpStringId,
  validateParams,
} from "../../../../utils/functionsUtil.js";
import Tmp from "../../../../models/gateway/Tmp.js";

export const stripe_createPayment = async (req, res) => {
  const _body = req.body;
  const mode = req.mode;
  const userId = req.userId;
  const gatewayClientId = req.gatewayClientID;
  const gatewaySecretKey = req.gatewaySecretKey;
  const gatewayUrlAPI = req.gatewayURL;

  try {
    const accessToken = gatewaySecretKey;

    const gatewayUrl = `${gatewayUrlAPI}/v1/checkout/sessions`;
    const checkOutRes = await checkOutTrans(
      gatewayUrl,
      accessToken,
      mode,
      userId,
      _body,
      req,
      res
    );

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

export const stripe_checkStatus = async (req, res) => {
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
      "errorMessages.gateway.notValidTransactionId",
      APIstatusCodes[401]
    );
  }

  const gatewayClientId = req.gatewayClientID;
  const gatewaySecretKey = req.gatewaySecretKey;
  const gatewayUrlAPI = req.gatewayURL;

  try {
    const accessToken = gatewaySecretKey;

    // headers
    let headers = {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    };

    const gatewayUrl = `${gatewayUrlAPI}/v1/checkout/sessions/${_transID}`;

    const orderResponse = await axios.get(gatewayUrl, {
      headers: headers,
    });

    _isValidId.gatewayStatus = orderResponse?.data?.payment_status;
    await _isValidId.save();

    // return response object
    const _data = new StatusResponse(
      orderResponse?.data?.payment_status,
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
  const headers = {
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/x-www-form-urlencoded",
  };

  const orderResponse = await axios.post(gatewayUrl, qs.stringify(payload), {
    headers,
  });

  const transactions = await createTransactionAndReturn(
    mode,
    gatewayUrl,
    orderResponse.data.url,
    _body,
    headers,
    payload,
    orderResponse,
    userId,
    tmptransaction._id
  );

  const initId = transactions._id.toString();

  return {
    payUrl: orderResponse.data.url,
    orderResponse,
    initId,
    gatewayId: orderResponse?.data?.id,
  };
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
      paymentType: PaymentGateways.stripe,
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
      amount: parseInt(_body.total_amount + "00"),
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

const generateAndGetPayload = (body, req, res, tmpId) => {
  const line_items = body.orderdata.map((item, index) => {
    return {
      quantity: item.qty,
      price_data: {
        currency: body.currency || "USD",
        product_data: {
          name: item.product_name,
        },
        unit_amount: parseInt(item.price + "00"),
      },
    };
  });

  const optionalParams = body.optional_params || {};

  let payload = {
    line_items,
    payment_method_types: optionalParams.payment_method_types || ["card"],
    mode: optionalParams.mode || "payment",
    success_url: `${CallBackUrl.stripe}&tmpId=${tmpId}`,
    cancel_url: `${CancelBackUrl.stripe}&tmpId=${tmpId}`,
    ...optionalParams, // Spread other optional params if any
  };

  return payload;
};
