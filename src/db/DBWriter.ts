import { EventQueue } from "./EventQueue";
import { TriggerModel } from "./models/Trigger.model";
import { TradeModel } from "./models/Trade.model";
import { TriggerEvent } from "../engine/types";
import { Trade } from "../paper/types";

export class DbWriter {
    private queue = new EventQueue();

    public logTrigger(event: TriggerEvent) {
        this.queue.enqueue(async () => {
            await TriggerModel.create({
                ...event,
                timestamp: new Date(event.timestamp)
            });
        });
    }

    public logTrade(trade: Trade, triggerId?: string) {
        this.queue.enqueue(async () => {
            await TradeModel.create({
                ...trade,
                triggerId,
                timestamp: new Date(trade.timestamp)
            });
        });
    }
}
