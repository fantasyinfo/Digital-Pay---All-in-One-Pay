import { Schema, model, Types } from "mongoose";
import { DBtables } from "../../utils/constants.js";
const domainSchema = new Schema(
  {
    userId: { type: Types.ObjectId, ref: DBtables.user, required: true },
    domainName: { type: String, required: true },
    status: { type: Boolean, required: true, default:true},
  },
  {
    timestamps: true,
  }
);
domainSchema.index({ "domains.domainName": 1 }, { unique: false });
export const Domain = model(DBtables.domain, domainSchema);
