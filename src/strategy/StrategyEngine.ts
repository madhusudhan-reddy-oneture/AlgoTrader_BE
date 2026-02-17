import { Direction } from "../state/types";
import { Action, StrategyInput, StrategyResult } from "./types";

export class StrategyEngine {
    private STOCK_THRESHOLD = 0.05;
    private SENSEX_THRESHOLD = 0.02;

    public evaluateSensex(currPrice: number, basePrice: number): Direction {
        return this.getDirection(currPrice, basePrice, this.SENSEX_THRESHOLD);
    }


    public evaluate(input: StrategyInput): StrategyResult {
        const stockDirection = this.getDirection(input.stockPrice, input.stockBase, this.STOCK_THRESHOLD);

        const stockTriggered = stockDirection == "NEUTRAL" ? false : true;

        const action = this.getAction(input.lastSensexDirection, stockDirection);

        if (action !== "HOLD") {
            console.log(`STOCK: Base -> ${input.stockBase}, Curr --> ${input.stockPrice}, ${stockDirection}`)
            console.log(`ACTION: ${action}`)
        }

        return { stockDirection, action, stockTriggered };
    }

    private getDirection(price: number, basePrice: number, threshold: number): Direction {
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