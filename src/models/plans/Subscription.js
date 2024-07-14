import { Schema, model, Types } from "mongoose";
import { DBtables, subscriptionStatus } from "../../utils/constants.js";
const subscriptionSchema = new Schema(
  {
    userId: { type: Types.ObjectId, ref: DBtables.user, required: true },
    planId: { type: Types.ObjectId, ref: DBtables.plan, required: true },
    startDate: { type: Date, required: true, default: Date.now },
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

export const Subscription = model(DBtables.subscription, subscriptionSchema);
