import { Schema, model } from "mongoose";

const TriggerSchema = new Schema({
    symbol: String,
    action: String,

    stockPrice: Number,
    sensexPrice: Number,

    lastStockPrice: Number,
    lastSensexPrice: Number,

    stockDirection: String,
    sensexDirection: String,

    timestamp: Date
}, { versionKey: false });

export const TriggerModel = model("Trigger", TriggerSchema);
