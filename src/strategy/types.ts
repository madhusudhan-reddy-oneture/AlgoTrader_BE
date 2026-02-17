import { SensexState } from './../state/types';
import { Direction } from "../state/types";

export type Action = "BUY" | "SELL" | "HOLD";

export interface StrategyInput {
    stockPrice: number;
    stockBase: number;
    lastSensexDirection: Direction;
}

export interface StrategyResult {
    stockDirection: Direction;
    action: Action;
    stockTriggered: boolean;
}