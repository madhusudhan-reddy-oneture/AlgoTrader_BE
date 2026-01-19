import { EventBus } from "../events/EventBus";
import { Direction, SensexState, StockState } from "./types";

export class StateStore {
    private stocks: Map<string, StockState> = new Map();
    private sensex: SensexState;

    public constructor() {
        this.sensex = {
            currPrice: 0,
            basePrice: 0,
            lastDirection: "NEUTRAL",
            lastTriggerTime: null
        }
    }

    public initStock(symbol: string, basePrice: number) {
        let stock: StockState = {
            symbol: symbol,
            currPrice: 0,
            basePrice: basePrice,
            lastDirection: "NEUTRAL",
            lastTriggerTime: null,
            triggersToday: 0
        };
        this.stocks.set(symbol, stock)
        EventBus.emit("stockUpdate", stock);
    }

    public getStock(symbol: string): StockState | undefined {
        return this.stocks.get(symbol);
    }

    public getAllStocks(): Map<string, StockState> {
        return this.stocks;
    }

    public updateStock(symbol: string, currPrice: number, basePrice: number, direction: Direction, trigger: boolean = false) {
        const stock = this.getStock(symbol);
        if (!stock) {
            return;
        }
        // console.log(`Stock Update for ${stock.symbol} ->`, stock.basePrice + " => " + basePrice);

        stock.lastDirection = direction;
        stock.basePrice = basePrice;
        stock.currPrice = currPrice

        if (trigger) {
            stock.lastTriggerTime = Date.now();
            stock.triggersToday += 1;
        }
        EventBus.emit("stockUpdate", stock);
    }

    public initSensex(basePrice: number) {
        this.sensex.basePrice = basePrice;
        this.sensex.lastTriggerTime = null;
        this.sensex.lastDirection = "NEUTRAL";
        EventBus.emit("sensexUpdate", this.sensex);
    }

    public getSensex(): SensexState {
        return this.sensex;
    }

    public updateSensex(currPrice: number, basePrice: number, direction: Direction, trigger: boolean = false) {
        // console.log("Sensex Update => ", this.sensex.basePrice + " => " + basePrice);

        this.sensex.currPrice = currPrice
        this.sensex.basePrice = basePrice;
        this.sensex.lastDirection = direction;

        if (trigger) {
            this.sensex.lastTriggerTime = Date.now();
        }
        EventBus.emit("sensexUpdate", this.sensex);
    }
}