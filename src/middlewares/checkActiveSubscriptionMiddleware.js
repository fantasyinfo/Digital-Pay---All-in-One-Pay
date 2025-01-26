import { responseHandler } from "../utils/responseHandler.js";
import {Subscription} from "../models/plans/Subscription.js";
import { subscriptionStatus } from "../utils/constants.js";

export const validateSubscription = async (req, res, next) => {
  const userId = req.userId; 
  
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

    req.subscription = currentSubscription;
    next();
  } catch (error) {
    return responseHandler.customError(
      req,
      res,
      error,
      "Validation Error on Subscription Check...",
      500
    );
  }
};
