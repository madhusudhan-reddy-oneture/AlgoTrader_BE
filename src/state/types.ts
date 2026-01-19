export type Direction = "UP" | "DOWN" | "NEUTRAL";

export interface StockState {
    symbol: string;
    currPrice: number;
    basePrice: number;
    lastDirection: Direction;
    lastTriggerTime: number | null;
    triggersToday: number;
}

export interface SensexState {
    currPrice: number;
    basePrice: number;
    lastDirection: Direction;
    lastTriggerTime: number | null;
}