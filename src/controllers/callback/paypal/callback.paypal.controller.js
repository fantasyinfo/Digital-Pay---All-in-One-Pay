import axios from "axios";
import Transaction from "../../../models/gateway/Transactions.js";
import Tmp from "../../../models/gateway/Tmp.js";

import { ApiKeysLive, ApiKeysSandbox } from "../../../utils/apiKeys.js";
import {
  Modes,
  PaymentGateways,
  PaymentStatus,
} from "../../../utils/constants.js";
import { paypalStatus } from "../../../utils/gateway.status.js";
import { responseHandler } from "../../../utils/responseHandler.js";
import fs from "fs";

export const paypal_callBack = async (req, res) => {
  const data = req.query;
  const transId = data.token;
  const tmpId = data.tmpId;

  try {
    const tmpDoc = await Tmp.findOne({ tmpId });

    if (!tmpDoc) {
      console.log("No Tmp document found with the given tmpId.");
      return;
    }

    // Fetch the transaction with this transId
    const _transaction = await Transaction.findOne({
      transId,
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
        ? ApiKeysLive[PaymentGateways.paypal].url
        : ApiKeysSandbox[PaymentGateways.paypal].url;
    const gatewayUrl = `${_url}/v2/checkout/orders/${transId}`;

    const orderResponse = await axios.get(gatewayUrl, {
      headers: _headers,
    });

    const orderRes = orderResponse?.data;
    const status = orderRes?.status;

    if (paypalStatus.includes(status)) {
      if (status === "APPROVED" || status === "COMPLETED") {
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
        token: transId,
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

export const paypal_cancelBack = async (req, res) => {
  const data = req.query;
  const transId = data.token;
  const tmpId = data.tmpId;
  try {
    // Fetch the transaction with this transId
    const _transaction = await Transaction.findOne({ transId, tmpId });

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
        ? ApiKeysLive[PaymentGateways.paypal].url
        : ApiKeysSandbox[PaymentGateways.paypal].url;
    const gatewayUrl = `${_url}/v2/checkout/orders/${transId}`;

    const orderResponse = await axios.get(gatewayUrl, {
      headers: _headers,
    });

    const orderRes = orderResponse?.data;
    const status = orderRes?.status;

    if (paypalStatus.includes(status)) {
      if (status === "APPROVED" || status === "COMPLETED") {
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
        token: transId,
      };

      // Extract the user's return URL from the transaction data
      const userCancelURL = _transaction.cancelUrl; // Assuming this is stored in the transaction

      // Construct the URL with query parameters
      const queryParams = new URLSearchParams(returnData).toString();
      const cancelUrlWithParams = `${userCancelURL}?${queryParams}`;

      // Redirect to the user's return URL with the data
      return res.redirect(cancelUrlWithParams);
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
// export const paypal_cancelBack = async (req, res) => {
//   const data = req.query;

//   // Convert data to string (for demonstration, you can format this as per your requirement)
//   const dataString = JSON.stringify(data, null, 2);

//   // Define the file path and name (adjust as per your file system structure)
//   const filePath = "./cancelback_data.txt";

//   // Write to the file
//   fs.writeFile(filePath, dataString, (err) => {
//     if (err) {
//       console.error("Error writing file:", err);
//       res.status(500).send("Error saving data");
//     } else {
//       console.log("Data saved successfully");
//       res.status(200).send("Data saved successfully");
//     }
//   });
// };
