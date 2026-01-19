import { SensexState } from './../state/types';
import { Direction } from "../state/types";

export type Action = "BUY" | "SELL" | "HOLD";

export interface StrategyInput {
    sensexPrice: number;
    sensexBase: number;
    stockPrice: number;
    stockBase: number;
    lastSensexDirection: Direction;
    lastStockDirection: Direction;
}

export interface StrategyResult {
    sensexDirection: Direction;
    stockDirection: Direction;
    action: Action;
    stockTriggered: boolean;
    sensexTriggered: boolean;
}