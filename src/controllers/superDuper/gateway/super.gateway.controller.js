import { AvailablePaymentGateway } from "../../../models/plans/AvailablePaymentGateway.js";
import { validateBody } from "../../../utils/functionsUtil.js";
import { responseHandler } from "../../../utils/responseHandler.js";

export const addNewGateway = async (req, res) => {
  const requiredValues = [
    "gatewayName",
    "gatewayHeaderName",
    "isNational",
    "isInternational",
  ];

  const isValid = validateBody(req.body, requiredValues, res, req);
  if (!isValid) {
    return;
  }

  const { gatewayName, gatewayHeaderName, isNational, isInternational } =
    req.body;
  const data = { gatewayName, gatewayHeaderName, isNational, isInternational };

  try {
    const addGateway = await AvailablePaymentGateway.create(data);
    if (addGateway) {
      return responseHandler.success(
        req,
        res,
        addGateway,
        "Payment Gateway Added."
      );
    } else {
      return responseHandler.error(
        req,
        res,
        addGateway,
        "Payment Gateway Not Added."
      );
    }
  } catch (error) {
    return responseHandler.error(req, res, error, "Payment Gateway Not Added.");
  }
};

export const fetchAllGateway = async (req, res) => {
  try {
    const allPaymentGateways = await AvailablePaymentGateway.find();
    if (allPaymentGateways) {
      return responseHandler.success(
        req,
        res,
        allPaymentGateways,
        "Payment Gateways List"
      );
    } else {
      return responseHandler.error(
        req,
        res,
        allPaymentGateways,
        "Payment Gateways Not Found."
      );
    }
  } catch (error) {
    return responseHandler.error(
      req,
      res,
      error,
      "Payment Gateways Not Founds."
    );
  }
};
