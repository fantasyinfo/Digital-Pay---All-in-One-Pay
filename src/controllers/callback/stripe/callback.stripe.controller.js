import axios from "axios";
import Transaction from "../../../models/gateway/Transactions.js";
import { ApiKeysLive, ApiKeysSandbox } from "../../../utils/apiKeys.js";
import {
  Modes,
  PaymentGateways,
  PaymentStatus,
} from "../../../utils/constants.js";
import { stripeStatus } from "../../../utils/gateway.status.js";
import { responseHandler } from "../../../utils/responseHandler.js";
import fs from "fs";
import Tmp from "../../../models/gateway/Tmp.js";

export const stripe_callBack = async (req, res) => {
  const data = req.query;
  const tmpId = data.tmpId;

  try {
    // Fetch the transaction with this transId
    const tmpDoc = await Tmp.findOne({ tmpId });

    if (!tmpDoc) {
      console.log("No Tmp document found with the given tmpId.");
      return;
    }

    const _transaction = await Transaction.findOne({
      tmpId: tmpDoc._id,
    });

    if (!_transaction) {
      // Return failed response
      return responseHandler.error(
        req,
        res,
        new Error("Transaction not found"),
        "errorMessages.transaction.notFound"
      );
    }

  
    // First check the status of this transaction
    const _headers = _transaction.headers;
    const _url =
      _transaction.mode === Modes.live
        ? ApiKeysLive[PaymentGateways.stripe].url
        : ApiKeysSandbox[PaymentGateways.stripe].url;
    const gatewayUrl = `${_url}/v1/checkout/sessions/${_transaction.transId}`;

    const orderResponse = await axios.get(gatewayUrl, {
      headers: _headers,
    });

    const orderRes = orderResponse?.data;
    const status = orderRes?.payment_status;

    if (stripeStatus.includes(status)) {
      if (status === "paid") {
        // Update transaction
        _transaction.currentStatus = PaymentStatus.completed;
        _transaction.isSuccess = true;
        _transaction.successResponse = { payment: true };
        _transaction.isFailed = false; // Ensure this is false
        _transaction.failureResponse = null; // Clear failure response
      } else {
        _transaction.isFailed = true;
        _transaction.failureResponse = { payment: false };
        _transaction.isSuccess = false; // Ensure this is false
        _transaction.successResponse = null; // Clear success response
      }

      _transaction.gatewayStatus = status;

      await _transaction.save();

      // Prepare the return data
      const returnData = {
        status: _transaction.gatewayStatus,
        token: _transaction.transId,
      };

      // Extract the user's return URL from the transaction data
      const userReturnUrl = _transaction.returnUrl; // Assuming this is stored in the transaction

      // Construct the URL with query parameters
      const queryParams = new URLSearchParams(returnData).toString();
      const returnUrlWithParams = `${userReturnUrl}?${queryParams}`;

      // Redirect to the user's return URL with the data
      return res.redirect(returnUrlWithParams);
    } else {
      return responseHandler.error(
        req,
        res,
        new Error("Invalid status"),
        "errorMessages.callback.invalidStatus"
      );
    }
  } catch (error) {
    return responseHandler.error(
      req,
      res,
      error,
      "errorMessages.callback.failed"
    );
  }
};

export const stripe_cancelBack = async (req, res) => {
  const data = req.query;
  const tmpId = data.tmpId;

  try {
    // Fetch the transaction with this transId
    const tmpDoc = await Tmp.findOne({ tmpId });

    if (!tmpDoc) {
      console.log("No Tmp document found with the given tmpId.");
      return;
    }

    const _transaction = await Transaction.findOne({
      tmpId: tmpDoc._id,
    });

    if (!_transaction) {
      // Return failed response
      return responseHandler.error(
        req,
        res,
        new Error("Transaction not found"),
        "errorMessages.transaction.notFound"
      );
    }

    // First check the status of this transaction
    const _headers = _transaction.headers;
    const _url =
      _transaction.mode === Modes.live
        ? ApiKeysLive[PaymentGateways.stripe].url
        : ApiKeysSandbox[PaymentGateways.stripe].url;
    const gatewayUrl = `${_url}/v1/checkout/sessions/${_transaction.transId}`;

    const orderResponse = await axios.get(gatewayUrl, {
      headers: _headers,
    });

    const orderRes = orderResponse?.data;
    const status = orderRes?.payment_status;

    if (stripeStatus.includes(status)) {
      if (status === "paid") {
        // Update transaction
        _transaction.currentStatus = PaymentStatus.completed;
        _transaction.isSuccess = true;
        _transaction.successResponse = { payment: true };
        _transaction.isFailed = false; // Ensure this is false
        _transaction.failureResponse = null; // Clear failure response
      } else {
        _transaction.isFailed = true;
        _transaction.failureResponse = { payment: false };
        _transaction.isSuccess = false; // Ensure this is false
        _transaction.successResponse = null; // Clear success response
      }

      _transaction.gatewayStatus = status;

      await _transaction.save();

      // Prepare the return data
      const returnData = {
        status: _transaction.gatewayStatus,
        token: _transaction.transId,
      };

      // Extract the user's return URL from the transaction data
      const userReturnUrl = _transaction.returnUrl; // Assuming this is stored in the transaction

      // Construct the URL with query parameters
      const queryParams = new URLSearchParams(returnData).toString();
      const returnUrlWithParams = `${userReturnUrl}?${queryParams}`;

      // Redirect to the user's return URL with the data
      return res.redirect(returnUrlWithParams);
    } else {
      return responseHandler.error(
        req,
        res,
        new Error("Invalid status"),
        "errorMessages.callback.invalidStatus"
      );
    }
  } catch (error) {
    return responseHandler.error(
      req,
      res,
      error,
      "errorMessages.callback.failed"
    );
  }
};
