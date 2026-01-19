import { StrategyInput } from './../strategy/types';
import { Tick } from "../market/types";
import { StateStore } from "../state/StateStore";
import { StrategyEngine } from "../strategy/StrategyEngine";
import { TriggerEvent } from "./types";
import { EventBus } from '../events/EventBus';

export class TriggerEngine {

    public constructor(private state: StateStore, private strategy: StrategyEngine) {
    }

    public processTick(tick: Tick, sensexPrice: number): TriggerEvent | null {
        // EventBus.emit("tick", tick);
        const sensex = this.state.getSensex();
        if (tick.symbol == "SENSEX") {
            this.state.updateSensex(tick.price, sensex.basePrice, sensex.lastDirection)
            return null
        }

        const stock = this.state.getStock(tick.symbol);

        if (!stock || sensex.basePrice == 0) {
            return null;
        }

        this.state.updateStock(tick.symbol, tick.price, stock.basePrice, stock.lastDirection)
        let lastStockPrice = stock.basePrice;
        let lastSensexPrice = sensex.basePrice;

        let strategyInput: StrategyInput = {
            sensexPrice: sensexPrice,
            sensexBase: sensex.basePrice,
            stockPrice: tick.price,
            stockBase: stock.basePrice,
            lastSensexDirection: sensex.lastDirection,
            lastStockDirection: stock.lastDirection
        }

        const result = this.strategy.evaluate(strategyInput);

        // const isStockTriggered = result.stockDirection !== "NEUTRAL";
        // const isSensexTriggered = result.sensexDirection !== "NEUTRAL";
        // console.log({
        //     symbol: stock.symbol,
        //     action: result.action,
        //     stockDirection: result.stockDirection,
        //     sensexDirection: result.sensexDirection,
        //     stockPrice: tick.price,
        //     lastStockPrice: lastStockPrice,
        //     sensexPrice: sensexPrice,
        //     lastSensexPrice: lastSensexPRice,
        //     timestamp: tick.timestamp
        // })

        if (result.stockTriggered) {
            this.state.updateStock(stock.symbol, tick.price, tick.price, result.stockDirection, true);
        }

        if (result.sensexTriggered) {
            this.state.updateSensex(sensexPrice, sensexPrice, result.sensexDirection, true);
        }

        if (result.stockTriggered || result.sensexTriggered) {
            const triggerEvent = {
                symbol: stock.symbol,
                action: result.action,
                stockDirection: result.stockDirection,
                sensexDirection: result.sensexDirection,
                stockPrice: tick.price,
                sensexPrice: sensexPrice,
                lastStockPrice: lastStockPrice,
                lastSensexPrice: lastSensexPrice,
                timestamp: tick.timestamp
            };

            EventBus.emit("trigger", triggerEvent)
            return triggerEvent;
        }
        return null;
    }
}