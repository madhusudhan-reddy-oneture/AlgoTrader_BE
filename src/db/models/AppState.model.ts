import { Schema, model } from "mongoose";

const StockStateSchema = new Schema({
    symbol: String,
    currPrice: Number,
    basePrice: Number,
    lastDirection: String,
    lastTriggerTime: Number,
    triggersToday: Number
}, { _id: false });

const SensexStateSchema = new Schema({
    currPrice: Number,
    basePrice: Number,
    lastDirection: String,
    lastTriggerTime: Number
}, { _id: false });

const AppStateSchema = new Schema({
    timestamp: { type: Date, default: Date.now },
    sensex: SensexStateSchema,
    stocks: [StockStateSchema]
}, { versionKey: false });

export const AppStateModel = model("AppState", AppStateSchema);