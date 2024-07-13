import { Schema, model, Types } from "mongoose";
import { DBtables } from "../../utils/constants.js";
const availablePaymentGatewaySchema = new Schema(
  {
    gatewayName: { type: String, required: true },
    gatewayHeaderName: { type: String, required: true, unique:true },
    status: { type: Boolean, required: true, default: true },
    isNational: { type: Boolean },
    isInternational: { type: Boolean },
  },
  {
    timestamps: true,
  }
);

export const AvailablePaymentGateway = model(
  DBtables.availablePaymentGateway,
  availablePaymentGatewaySchema
);
