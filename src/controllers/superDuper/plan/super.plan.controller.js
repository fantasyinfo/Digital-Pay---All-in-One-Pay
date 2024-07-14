import { HistoricalSubscription } from "../../../models/plans/HistoricalSubscription.js";
import { Plan } from "../../../models/plans/Plans.js";
import { Subscription } from "../../../models/plans/Subscription.js";
import { PlansPerios, subscriptionStatus } from "../../../utils/constants.js";
import { formatDateTime, validateBody } from "../../../utils/functionsUtil.js";
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

export const buyOrRenewSubscription = async (req, res) => {
  const requiredValues = ["planId", "planPeriod"];

  // Validate request body
  const isValid = validateBody(req.body, requiredValues, res, req);
  if (!isValid) {
    return;
  }

  const { planId, planPeriod } = req.body;
  const userId = req.userId; // Assuming userId is extracted from request

  try {
    // Fetch plan details
    const planDetails = await Plan.findById(planId);
    if (!planDetails) {
      return responseHandler.error(req, res, null, "Plan not found.");
    }

    // Fetch user's previous active subscription
    const previousSubscription = await Subscription.findOne({
      userId: userId,
      status: subscriptionStatus[0],
      endDate: { $gt: new Date() }, // Find subscriptions with end date greater than current date (active subscriptions)
    }).sort({ endDate: -1 }); // Sort by endDate descending to get the most recent subscription

    // Calculate start date for new subscription
    let startDate = new Date(); // Current date
    if (previousSubscription) {
      startDate = new Date(previousSubscription.endDate); // Start new subscription after previous one ends
    }

    // Calculate end date for new subscription
    let endDate = new Date(startDate);
    if (planPeriod === PlansPerios.yearly) {
      endDate.setFullYear(endDate.getFullYear() + 1); // Add 1 year
    } else {
      endDate.setMonth(endDate.getMonth() + 1); // Add 1 month
    }

    // Create subscription object
    const subscriptionObj = {
      userId: userId,
      planId: planId,
      startDate: startDate,
      endDate: endDate,
      status: subscriptionStatus[0], // Assuming subscriptionStatus is defined elsewhere
    };


    // Save subscription to database
    const newSubscription = await Subscription.create(subscriptionObj);
    const addHistory = await HistoricalSubscription.create(subscriptionObj);
    // Handle response
    if (newSubscription) {
      return responseHandler.success(
        req,
        res,
        newSubscription,
        "Subscription plan added successfully."
      );
    } else {
      return responseHandler.error(
        req,
        res,
        null,
        "Failed to add subscription plan."
      );
    }
  } catch (error) {
    return responseHandler.error(
      req,
      res,
      error,
      "Subscription plan not added."
    ); // Handle any caught errors
  }
};
