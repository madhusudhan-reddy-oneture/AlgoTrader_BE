import { Schema, model } from "mongoose";

const TradeSchema = new Schema({
    symbol: String,
    action: String,
    price: Number,
    quantity: Number,
    pnl: Number,
    timestamp: Date,
    triggerId: Schema.Types.ObjectId
}, { versionKey: false });

export const TradeModel = model("Trade", TradeSchema);
