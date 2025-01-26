import { AvailablePaymentGateway } from "../../../models/plans/AvailablePaymentGateway.js";
import { EnablePaymentGateway } from "../../../models/plans/EnablePaymentGateway.js";
import { GatewaysTypes } from "../../../utils/constants.js";
import { validateBody } from "../../../utils/functionsUtil.js";
import { responseHandler } from "../../../utils/responseHandler.js";

export const enableGateway = async (req, res) => {
  const requiredValues = ["gatewayId"];
  const isValid = validateBody(req.body, requiredValues, res, req);
  if (!isValid) return;

  const { gatewayId } = req.body;
  const { userId, subscription } = req;
  const { internationalGateways, nationalGateways } = subscription || {};

  try {
    // Fetch current gateway details
    const currentGatewayDetails = await AvailablePaymentGateway.findById(
      gatewayId
    );
    if (!currentGatewayDetails) {
      return responseHandler.customError(
        req,
        res,
        "This Gateway Not Found, Please check.",
        "This Gateway Not Found, Please check.",
        500
      );
    }

    const gatewayType = currentGatewayDetails.isNational
      ? GatewaysTypes.national
      : GatewaysTypes.international;

    // Prepare creation object
    const createObj = {
      userId,
      gatewayId,
      credentials: req.body.credentials,
      status: true,
      isNational: gatewayType === GatewaysTypes.national,
      isInternational: gatewayType === GatewaysTypes.international,
      mode:req.body.mode
    };

    // Check if the gateway is already enabled for the user
    const existingGateway = await EnablePaymentGateway.findOne({
      userId,
      gatewayId,
      mode:req.body.mode,
      isNational: createObj.isNational,
      isInternational: createObj.isInternational,
    });

    if (existingGateway) {
      return responseHandler.customError(
        req,
        res,
        "This Gateway is already enabled.",
        "This Gateway is already enabled.",
        400
      );
    }

    // Check existing gateways and limit
    const existingGateways = await EnablePaymentGateway.find({
      userId,
      isNational: createObj.isNational,
      isInternational: createObj.isInternational,
    });

    const maxAllowedGateways =
      gatewayType === GatewaysTypes.national
        ? nationalGateways
        : internationalGateways;

    if (
      existingGateways.length >=
      (maxAllowedGateways === -1 ? Infinity : maxAllowedGateways)
    ) {
      return responseHandler.customError(
        req,
        res,
        `All Eligible ${
          gatewayType === GatewaysTypes.national ? "National" : "International"
        } Gateways For Current Plan are already enabled, please upgrade the plan to enable the new gateway.`
      );
    }

    // Create and respond with new enabled gateway
    const insertNew = await EnablePaymentGateway.create(createObj);
    return responseHandler.success(
      req,
      res,
      insertNew,
      "Gateway enabled, setting saved."
    );
  } catch (error) {
    console.error(error);
    return responseHandler.error(req, res, error, "Gateway Not Added.");
  }
};


export const getAllEnabledGateway = async (req, res) => {

  const userId = req.userId;
  let queryID = req.query.id || null;

  console.log(JSON.stringify(req.query, null, 2));
  try {
    const allEnablePaymentGateway = await EnablePaymentGateway.find({ userId });
    if (allEnablePaymentGateway) {
      return responseHandler.success(
        req,
        res,
        allEnablePaymentGateway,
        "All Paymments Gateway Enabled Lists List"
      );
    } else {
      return responseHandler.error(
        req,
        res,
        allEnablePaymentGateway,
        "No Paymments Gateway Enabled Lists Not Found."
      );
    }
  } catch (error) {
    return responseHandler.error(req, res, error, "Paymments Gateway Enabled Lists Not Founds.");
  }
};