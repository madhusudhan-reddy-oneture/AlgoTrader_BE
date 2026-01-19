import { Action } from "../strategy/types";

export interface TriggerEvent {
    symbol: string,
    action: Action;
    stockDirection: string;
    sensexDirection: string;
    stockPrice: number,
    sensexPrice: number,
    lastStockPrice: number,
    lastSensexPrice: number
    timestamp: number;
}