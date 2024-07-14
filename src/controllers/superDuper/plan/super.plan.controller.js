import { Plan } from "../../../models/plans/Plans.js";
import { validateBody } from "../../../utils/functionsUtil.js";
import { responseHandler } from "../../../utils/responseHandler.js";

export const addNewPlan = async (req, res) => {
  const requiredValues = [
    "title",
    "internationalGateways",
    "nationalGateways",
    "maxDomains",
    "features",
    "monthlyPrice",
    "yearlyPrice",
    "popular",
    "exclusive",
    "description",
  ];

  const isValid = validateBody(req.body, requiredValues, res, req);
  if (!isValid) {
    return;
  }

  const {
    title,
    internationalGateways,
    nationalGateways,
    maxDomains,
    features,
    monthlyPrice,
    yearlyPrice,
    popular,
    exclusive,
    description,
  } = req.body;
  const data = {
    title,
    internationalGateways,
    nationalGateways,
    maxDomains,
    features,
    monthlyPrice,
    yearlyPrice,
    popular,
    exclusive,
    description,
  };

  try {
    const addPlans = await Plan.create(data);
    if (addPlans) {
      return responseHandler.success(req, res, addPlans, "Plan Added.");
    } else {
      return responseHandler.error(req, res, addPlans, "Plan Not Added.");
    }
  } catch (error) {
    return responseHandler.error(req, res, error, "Plan Not Added.");
  }
};

export const fetchAllPlan = async (req, res) => {
  try {
    const allPlans = await Plan.find();
    if (allPlans) {
      return responseHandler.success(req, res, allPlans, "Plans Lists List");
    } else {
      return responseHandler.error(
        req,
        res,
        allPlans,
        "Plans Lists Not Found."
      );
    }
  } catch (error) {
    return responseHandler.error(req, res, error, "Plans Lists Not Founds.");
  }
};
