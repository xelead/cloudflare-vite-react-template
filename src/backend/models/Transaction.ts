import mongoose, { Schema, Document } from "mongoose";

export interface ITransaction extends Document {
  symbol: string;
  type: "BUY" | "SELL";
  shares: number;
  price: number;
  total: number;
  timestamp: Date;
}

const TransactionSchema = new Schema<ITransaction>({
  symbol: {
    type: String,
    required: true,
    uppercase: true,
  },
  type: {
    type: String,
    enum: ["BUY", "SELL"],
    required: true,
  },
  shares: {
    type: Number,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  total: {
    type: Number,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model<ITransaction>("Transaction", TransactionSchema);
