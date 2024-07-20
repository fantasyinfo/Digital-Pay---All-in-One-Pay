import { Domain } from "../../../models/plans/Domain.js";
import { Subscription } from "../../../models/plans/Subscription.js";
import { responseHandler } from "../../../utils/responseHandler.js";
import { validateBody } from "../../../utils/functionsUtil.js";
import { subscriptionStatus } from "../../../utils/constants.js";

export const addDomains = async (req, res) => {
  const requiredValues = ["domains"];
  const isValid = validateBody(req.body, requiredValues, res, req);
  if (!isValid) {
    return;
  }

  const { domains } = req.body;
  const userId = req.userId; // Assuming you have user information from the request

  if (!Array.isArray(domains)) {
    return responseHandler.error(req, res, null, "Domains should be an array.");
  }

  try {
    // Fetch the user's current subscription
    const currentSubscription = await Subscription.findOne({
      userId,
      status: subscriptionStatus[0],
    })
      .sort({ endDate: -1 })
      .populate("planId");

    if (!currentSubscription) {
      return responseHandler.customError(
        req,
        res,
        "No active subscription found.",
        "No active subscription found.",
        500
      );
    }

    const { planId } = currentSubscription;
    const maxDomains = planId.maxDomains;

    // Fetch the user's current domains count
    const domainEntry = await Domain.findOne({ userId });

    if (maxDomains != -1) {
      // handle unlimited domains
      const currentDomainCount = domainEntry ? domainEntry.domains.length : 0;
      // Check if adding the new domains would exceed the maxDomains limit
      if (currentDomainCount + domains.length > maxDomains) {
        return responseHandler.customError(
          req,
          res,
          `You have reached the maximum number of domains allowed by your plan (${maxDomains}). Please upgrade your plan.`,
          `You have reached the maximum number of domains allowed by your plan (${maxDomains}). Please upgrade your plan.`,
          500
        );
      }
    }

    if (domainEntry) {
      // Filter out domains that already exist
      const existingDomains = new Set(
        domainEntry.domains.map((d) => d.domainName)
      );
      const newDomains = domains.filter(
        (domain) => !existingDomains.has(domain)
      );

      if (newDomains.length > 0) {
        // Append new, non-duplicate domains
        domainEntry.domains.push(
          ...newDomains.map((domain) => ({
            domainName: domain,
            status: true, // Default status, customize as needed
          }))
        );
      } else {
        return responseHandler.customError(
          req,
          res,
          null,
          "Domain Already Added",
          500
        );
      }
    } else {
      // If the user doesn't have a domain entry, create a new one
      const newDomainEntry = new Domain({
        userId,
        domains: domains.map((domain) => ({
          domainName: domain,
          status: true,
        })),
      });

      await newDomainEntry.save();
    }

    const savedDomains = await domainEntry.save();
    if (savedDomains) {
      return responseHandler.success(req, res, savedDomains, "Domains Added.");
    } else {
      return responseHandler.error(req, res, null, "Domains Not Added.");
    }
  } catch (error) {
    console.log(error)
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
