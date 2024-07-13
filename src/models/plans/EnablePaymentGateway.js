import { Schema, model, Types } from "mongoose";
import { DBtables } from "../../utils/constants.js";
const enablePaymentGatewaySchema = new Schema({
  user: { type: Types.ObjectId, ref: DBtables.user, required: true },

  gateways: [
    {
      gatewayId: {
        type: Types.ObjectId,
        ref: DBtables.availablePaymentGateway,
        required: true,
      },
      clientId: { type: String, required: true },
      clientSecret: { type: String, required: true },
      status: { type: Boolean, default: false },
    },
  ],
},
{
  timestamps: true,
});

export const EnablePaymentGateway = model(
  DBtables.enablePaymentGateway,
  enablePaymentGatewaySchema
);
