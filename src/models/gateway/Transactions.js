import mongoose from 'mongoose';
import { Modes,PaymentGateways,DBtables,PaymentStatus,SupportedCurrency } from '../../utils/constants.js';

const { Schema } = mongoose;

const transactionSchema = new Schema({
  mode: {
    type: String,
    enum: [Modes.sandbox,Modes.live],
    required: true
  },
  paymentType: {
    type: String,
    enum: [PaymentGateways.paypal,PaymentGateways.stripe],
    required: true
  },
  gatewayUrl: {
    type: String,
    required: true
  },
  returnUrl:{
    type:String,
    required:true
  },
  cancelUrl:{
    type:String,
    required:true
  },
  headers:{
    type:Object,
  },
  payload: {
    type: Object,
    required: true
  },
  response: {
    type: Object
  },
  payUrl: {
    type: String,
    required: true
  },
  successResponse: {
    type: Object,
    required: false
  },
  failureResponse: {
    type: Object,
    required: false
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: DBtables.user ,
    required: true
  },
  transId: {
    type: String,
    required: true,
    unique: true
  },
  amount: {
    type: Number,
    required: true
  },
  isSuccess: {
    type: Boolean,
    default: false,
    required: true
  },
  isFailed: {
    type: Boolean,
    default: false,
    required: true
  },
  currentStatus: {
    type: String,
    enum: [PaymentStatus.pending,PaymentStatus.failed,PaymentStatus.completed],
    default: PaymentStatus.pending,
    required: true
  },
  gatewayStatus:{
    type: String,
  },
  currency: {
    type: String,
    required: true,
    default: SupportedCurrency.USD
  },
  description: {
    type: String,
    required: false
  }
},{
    timestamps:true
});

// Add indexes
transactionSchema.index({ transId: 1 }, { unique: true });
transactionSchema.index({ userId: 1 });
transactionSchema.index({ mode: 1 });
transactionSchema.index({ paymentType: 1 });
transactionSchema.index({ currentStatus: 1 });

const Transaction = mongoose.model(DBtables.transaction, transactionSchema);

export default Transaction;
