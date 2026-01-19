import { Direction } from "../state/types";
import { Action, StrategyInput, StrategyResult } from "./types";

export class StrategyEngine {
    private STOCK_THRESHOLD = 0.05;
    private SENSEX_THRESHOLD = 0.02;

    public evaluate(input: StrategyInput): StrategyResult {
        const sensexDirection = this.getDirection(input.sensexPrice, input.sensexBase, this.SENSEX_THRESHOLD, input.lastSensexDirection);
        const stockDirection = this.getDirection(input.stockPrice, input.stockBase, this.STOCK_THRESHOLD, input.lastStockDirection);

        const sensexTriggered = sensexDirection == "NEUTRAL" ? false : true;

        // this.detectTrigger(
        //     input.lastSensexDirection,
        //     sensexDirection
        // );

        const stockTriggered = stockDirection == "NEUTRAL" ? false : true;

        // this.detectTrigger(
        //     input.lastStockDirection,
        //     stockDirection
        // );

        const action = this.getAction(sensexDirection, stockDirection);

        if (sensexDirection != "NEUTRAL" || stockDirection !== "NEUTRAL") {
            console.log(`SENSEX: Base -> ${input.sensexBase}, Curr --> ${input.sensexPrice}, ${sensexDirection}`)
            console.log(`STOCK: Base -> ${input.stockBase}, Curr --> ${input.stockPrice}, ${stockDirection}`)
            console.log(`ACTION: ${action}`)

        }

        return { sensexDirection, stockDirection, action, sensexTriggered, stockTriggered };
    }

    private getDirection(price: number, basePrice: number, threshold: number, Direction: Direction): Direction {
        if (price >= basePrice * (1 + threshold)) {
            return "UP";
        }
        if (price <= basePrice * (1 - threshold)) {
            return "DOWN";
        }
        return "NEUTRAL"
        // return Direction;
    }

    private getAction(sensexDirection: Direction, stockDirection: Direction): Action {
        if (sensexDirection == "UP" && stockDirection == "UP") {
            return "SELL";
        }
        if (sensexDirection == "DOWN" && stockDirection == "DOWN") {
            return "BUY";
        }
        return "HOLD";
    }

    private detectTrigger(
        prev: Direction,
        curr: Direction
    ): boolean {
        return prev !== curr;
    }
}