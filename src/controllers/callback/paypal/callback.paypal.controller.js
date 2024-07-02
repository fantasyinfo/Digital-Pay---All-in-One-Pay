import axios from "axios";
import Transaction from "../../../models/gateway/Transactions.js";
import { ApiKeysLive, ApiKeysSandbox } from "../../../utils/apiKeys.js";
import {
  Modes,
  PaymentGateways,
  PaymentStatus,
} from "../../../utils/constants.js";
import { paypalStatus } from "../../../utils/gateway.status.js";
import { responseHandler } from "../../../utils/responseHandler.js";

export const paypal_callBack = async (req, res) => {
    const data = req.query;
    const transId = data.token;
  
    try {
      // Fetch the transaction with this trxId, then fetch the order status again
      // Once confirmed, update the transaction and return the response to the user's return URL.
      const _transaction = await Transaction.findOne({ transId });
  
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
  
      if (
        status === paypalStatus["APPROVED"] ||
        status === paypalStatus["COMPLETED"]
      ) {
        // Update transaction
        _transaction.currentStatus = PaymentStatus.completed;
        _transaction.isSuccess = true;
        _transaction.successResponse = { payment: true };
      } else {
        _transaction.isFailed = true;
        _transaction.failureResponse = { payment: false };
      }
  
      _transaction.gatewayStatus = status;
  
      await _transaction.save();
  
      // Return the response to the user.
      const returnData = {
        data: {
          status: _transaction.gatewayStatus,
          token: transId,
        },
        transaction: _transaction.toObject(),
      };
  
      return responseHandler.success(
        req,
        res,
        returnData,
        "successMessages.callback.success"
      );
    } catch (error) {
      return responseHandler.error(
        req,
        res,
        error,
        "errorMessages.callback.failed"
      );
    }
  };
