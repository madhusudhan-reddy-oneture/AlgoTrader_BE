import { EventEmitter } from 'stream';
import { MarketDataAdapter } from './MarketDataAdapter';
import { StockInfo, Tick } from './types';
import { SensexState, StockState } from '../state/types';

export class MockMarketDataAdapter implements MarketDataAdapter {
    private emitter = new EventEmitter();
    private intervalId?: NodeJS.Timeout;

    // Store live prices separately
    private sensexPrice: number;
    private stockPrices: Map<string, number> = new Map();

    public constructor(private sensex: SensexState, private stocks: Map<string, StockState>) {
        this.sensexPrice = sensex.basePrice;

        stocks.forEach(stock => {
            this.stockPrices.set(stock.symbol, stock.basePrice);
        });
    }

    public start(): void {
        this.intervalId = setInterval(() => this.generateTick(), 500)
    }

    private generateTick(): void {
        // 🔹 Sensex movement (±0.15%)
        const sensexPctChange = (Math.random() - 0.5) * 0.05;
        this.sensexPrice *= (1 + sensexPctChange);

        this.emit("SENSEX", this.sensexPrice);

        // 🔹 Stock movements correlated with Sensex
        this.stocks.forEach(stock => {
            const beta = 0.8 + Math.random() * 0.7; // 0.8 → 1.5
            const noise = (Math.random() - 0.5) * 0.002;

            // const pctChange = sensexPctChange * beta + noise;
            const pctChange = (Math.random() - 0.5) * 0.05;

            let price = this.stockPrices.get(stock.symbol)!;
            price *= (1 + pctChange);

            price = Math.max(1, price);
            this.stockPrices.set(stock.symbol, price);

            this.emit(stock.symbol, price);
        });
    }

    private emit(symbol: string, price: number) {
        this.emitter.emit("tick", {
            symbol,
            price: Number(price.toFixed(2)),
            timestamp: Date.now()
        });
    }

    public stop(): void {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = undefined;
        }
    }

    public onTick(callback: (tick: Tick) => void): void {
        this.emitter.on("tick", callback);
    }

}