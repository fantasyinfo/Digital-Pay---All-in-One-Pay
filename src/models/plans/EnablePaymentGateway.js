import { Schema, model, Types } from "mongoose";
import { DBtables } from "../../utils/constants.js";
const enablePaymentGatewaySchema = new Schema(
  {
    userId: { type: Types.ObjectId, ref: DBtables.user, required: true },
    gatewayId: {
      type: Types.ObjectId,
      ref: DBtables.availablePaymentGateway,
      required: true,
    },
    credentials: { type: Object, required: true },
    status: { type: Boolean, default: true },
    isNational: { type: Boolean, required: true },
    isInternational: { type: Boolean, required: true },
    mode:{type:String}
  },
  {
    timestamps: true,
  }
);

export const EnablePaymentGateway = model(
  DBtables.enablePaymentGateway,
  enablePaymentGatewaySchema
);
