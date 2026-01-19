import { Tick } from "./types";

export interface MarketDataAdapter{
    start(): void;
    stop(): void;
    onTick(callback: (tick: Tick) => void): void;
}