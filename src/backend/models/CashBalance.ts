import mongoose, { Schema, Document } from "mongoose";

export interface ICashBalance extends Document {
  amount: number;
}

const CashBalanceSchema = new Schema<ICashBalance>({
  amount: {
    type: Number,
    required: true,
    default: 100000,
  },
});

export default mongoose.model<ICashBalance>("CashBalance", CashBalanceSchema);
