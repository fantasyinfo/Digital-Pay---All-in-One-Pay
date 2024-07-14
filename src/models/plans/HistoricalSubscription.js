import { Schema, model, Types } from "mongoose";
import { DBtables, subscriptionStatus } from "../../utils/constants.js";

const HistoricalSubscriptionSchema = new Schema(
  {
    userId: { type: Types.ObjectId, ref: DBtables.user, required: true },
    planId: { type: Types.ObjectId, ref: DBtables.plan, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    status: {
      type: String,
      enum: subscriptionStatus,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const HistoricalSubscription = model(
  DBtables.historicalSubscription,
  HistoricalSubscriptionSchema
);
