import { Schema, model } from "mongoose";
import { DBtables } from "../../utils/constants.js";

const planSchema = new Schema({
  name: { type: String, required: true },
  internationalGateways: { type: Number, required: true },
  nationalGateways: { type: Number, required: true },
  maxDomains: { type: Number, required: true },
  price: { type: Number, required: true },
  features: { type: [String], required: true },
},
{
  timestamps: true,
});

export const Plan = model(DBtables.plan, planSchema);
