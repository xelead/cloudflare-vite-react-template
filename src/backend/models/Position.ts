import mongoose, { Schema, Document } from "mongoose";

export interface IPosition extends Document {
  symbol: string;
  shares: number;
  avgBuyPrice: number;
  lastBuyPrice: number;
}

const PositionSchema = new Schema<IPosition>({
  symbol: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
  },
  shares: {
    type: Number,
    required: true,
    default: 0,
  },
  avgBuyPrice: {
    type: Number,
    required: true,
    default: 0,
  },
  lastBuyPrice: {
    type: Number,
    required: true,
    default: 0,
  },
});

export default mongoose.model<IPosition>("Position", PositionSchema);
