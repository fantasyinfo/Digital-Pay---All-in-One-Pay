import { Schema, model } from "mongoose";
import { DBtables } from "../../utils/constants.js";

const planSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  internationalGateways: { type: Number, required: true },
  nationalGateways: { type: Number, required: true },
  maxDomains: { type: Number, required: true },
  monthlyPrice: { type: Number, required: true },
  yearlyPrice: { type: Number, required: true },
  popular: { type: Boolean, default:false, required: true },
  exclusive: { type: Boolean, default:false, required: true },
  features: { type: [String], required: true },
},
{
  timestamps: true,
});

export const Plan = model(DBtables.plan, planSchema);
