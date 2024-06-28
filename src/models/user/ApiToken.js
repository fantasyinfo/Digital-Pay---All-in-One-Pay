import mongoose from "mongoose";
import { DBtables } from "../../utils/constants.js";

const { Schema } = mongoose;

// Define apitoken schema
const apiTokenSchema = new Schema(
  {
    user_id: {
      type: mongoose.Schema.ObjectId,
      ref: DBtables.user,
      required: true,
    },
    live_keys: {
      client_id: { type: String },
      secret_key: { type: String },
    },
    sandbox_keys: {
      client_id: { type: String },
      secret_key: { type: String },
    },
  },
  {
    timestamps: true,
  }
);

const ApiToken = mongoose.model(DBtables.api_keys, apiTokenSchema);

export default ApiToken;
