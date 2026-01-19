import { Action } from "../strategy/types";

export interface Position {
    symbol: string;
    totalInv: number;
    quantity: number;
}

export interface Trade {
    symbol: string;
    action: Action;
    price: number;
    quantity: number;
    pnl?: number;
    timestamp: number;
}
