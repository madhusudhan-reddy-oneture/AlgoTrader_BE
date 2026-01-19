import { Action } from './../strategy/types';
import { TriggerEvent } from './../engine/types';
import { Position, Trade } from "./types";
import { EventBus } from '../events/EventBus';

export class PaperTrader {
    private positions: Map<string, Position> = new Map();
    private trades: Trade[] = [];

    public handleEvent(event: TriggerEvent): Trade | null {
        const pos = this.positions.get(event.symbol);

        if (event.action === "BUY") {
            if (!pos) {
                const newPos = {
                    symbol: event.symbol,
                    totalInv: event.stockPrice,
                    quantity: 1
                };
                this.positions.set(event.symbol, newPos);

            }
            else {
                pos.quantity += 1
                pos.totalInv += event.stockPrice
            }
            return this.recordTrade("BUY", event);
        }

        if (event.action === "SELL") {
            if (!pos || pos.quantity === 0) {
                return null;
            }

            const avgBuyPrice = pos.totalInv / pos.quantity;
            const pnl = event.stockPrice - avgBuyPrice;
            pos.quantity -= 1;
            pos.totalInv -= avgBuyPrice;

            if (pos.quantity === 0) {
                this.positions.delete(event.symbol);
            }

            return this.recordTrade("SELL", event, pnl);
        }

        return null
    }

    private recordTrade(action: Action, event: TriggerEvent, pnl?: number): Trade | null {
        const trade: Trade = {
            symbol: event.symbol,
            action: action,
            price: event.stockPrice,
            quantity: 1,
            pnl: pnl,
            timestamp: event.timestamp
        }

        this.trades.push(trade);
        EventBus.emit("trade", event);
        return trade;
    }

    getOpenPositions(): Position[] {
        return Array.from(this.positions.values());
    }

    getTradeHistory(): Trade[] {
        return this.trades;
    }

}