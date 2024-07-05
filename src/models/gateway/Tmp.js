import mongoose from "mongoose";
import { DBtables } from "../../utils/constants.js";

const { Schema } = mongoose;

const tmpSchema = new Schema({
  tmpId: {
    type: String,
    require: true,
  },
});

tmpSchema.index({ tmpId: 1 }, { unique: true });

const Tmp = mongoose.model(DBtables.tmp, tmpSchema);

export default Tmp;
