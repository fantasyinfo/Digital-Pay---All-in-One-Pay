import { Domain } from "../../../models/plans/Domain.js";
import { responseHandler } from "../../../utils/responseHandler.js";
import { validateBody } from "../../../utils/functionsUtil.js";

export const addDomains = async (req, res) => {
  const requiredValues = ["domainName"];
  const isValid = validateBody(req.body, requiredValues, res, req);
  if (!isValid) {
    return;
  }

  const { domainName } = req.body;
  const { userId, subscription } = req;

  const { planId } = subscription;
  const maxDomains = planId.maxDomains;

  try {
    // Fetch the user's current domains count
    const domainEntry = await Domain.findOne({ userId, domainName });

    if (domainEntry) {
      return responseHandler.customError(
        req,
        res,
        `This domain name is already added.`,
        `This domain name is already added.`,
        500
      );
    }

    if (maxDomains != -1) {
      const domainEntries = await Domain.find({ userId });
      // Check if adding the new domains would exceed the maxDomains limit
      if (domainEntries.length >= maxDomains && maxDomains > 0) {
        return responseHandler.customError(
          req,
          res,
          `You have reached the maximum number of domains allowed by your plan (${maxDomains}). Please upgrade your plan.`,
          `You have reached the maximum number of domains allowed by your plan (${maxDomains}). Please upgrade your plan.`,
          500
        );
      }
    }

    const savedDomains = await Domain.create({
      userId,
      domainName,
      status: true,
    });
    if (savedDomains) {
      return responseHandler.success(req, res, savedDomains, "Domains Added.");
    } else {
      return responseHandler.error(req, res, null, "Domains Not Added.");
    }
  } catch (error) {
    console.log(error);
    return responseHandler.error(req, res, error, "Domains Not Added.");
  }
};

export const getAllDomains = async (req, res) => {
  const userId = req.userId;
  try {
    const allPlans = await Domain.find({ userId });
    if (allPlans) {
      return responseHandler.success(
        req,
        res,
        allPlans,
        "All Domains Lists List"
      );
    } else {
      return responseHandler.error(
        req,
        res,
        allPlans,
        "No Domains Lists Not Found."
      );
    }
  } catch (error) {
    return responseHandler.error(req, res, error, "Domains Lists Not Founds.");
  }
};
