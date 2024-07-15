import { Schema, model, Types } from "mongoose";
import { DBtables } from "../../utils/constants.js";
const domainSchema = new Schema(
  {
    userId: { type: Types.ObjectId, ref: DBtables.user, required: true },
    domains: [
      {
        domainName: {
          type: String,
          required: true,
        },
        status: {
          type: Boolean,
          required: true,
          default: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const Domain = model(DBtables.domain, domainSchema);
