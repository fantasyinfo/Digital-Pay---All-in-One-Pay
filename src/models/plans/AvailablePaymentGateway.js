import { Schema, model, Types } from "mongoose";
import { DBtables } from "../../utils/constants.js";
const availablePaymentGatewaySchema = new Schema(
  {
    gatewayName: { type: String, required: true },
    gatewayHeaderName: { type: String, required: true, unique:true },
    status: { type: Boolean, required: true, default: true },
    isNational: { type: Boolean },
    isInternational: { type: Boolean },
    gatewayCountry: { type: String, required:false },
    gatewayWebsite: { type: String, required:true },
    gatewayLogo: { type: String, required:true },
  },
  {
    timestamps: true,
  }
);

export const AvailablePaymentGateway = model(
  DBtables.availablePaymentGateway,
  availablePaymentGatewaySchema
);
