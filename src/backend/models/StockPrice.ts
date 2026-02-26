import mongoose, { Schema, Document } from "mongoose";

export interface IStockPrice extends Document {
  symbol: string;
  price: number;
  lastUpdated: Date;
}

const StockPriceSchema = new Schema<IStockPrice>({
  symbol: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
  },
  price: {
    type: Number,
    required: true,
    default: 0,
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model<IStockPrice>("StockPrice", StockPriceSchema);
