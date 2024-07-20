import { AvailablePaymentGateway } from "../../../models/plans/AvailablePaymentGateway.js";
import { validateBody } from "../../../utils/functionsUtil.js";
import { responseHandler } from "../../../utils/responseHandler.js";

export const addNewGateway = async (req, res) => {
  const requiredValues = [
    "gatewayName",
    "gatewayHeaderName",
    "isNational",
    "isInternational",
    "gatewayWebsite",
    "gatewayLogo",
  ];

  const isValid = validateBody(req.body, requiredValues, res, req);
  if (!isValid) {
    return;
  }

  const {
    gatewayName,
    gatewayHeaderName,
    isNational,
    isInternational,
    gatewayCountry,
    gatewayWebsite,
    gatewayLogo,
  } = req.body;
  const data = {
    gatewayName,
    gatewayHeaderName,
    isNational,
    isInternational,
    gatewayCountry,
    gatewayWebsite,
    gatewayLogo,
  };

  try {
    // first check if this header is already then return
    const already = await AvailablePaymentGateway.findOne({
      gatewayHeaderName,
    });

    if (already)
      return responseHandler.customError(
        req,
        res,
        already,
        "Payment Gateway is Already added.",
        403
      );

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
