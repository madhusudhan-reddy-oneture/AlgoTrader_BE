import { AngelCredentials } from './../market/types';
import { StrategyEngine } from './../strategy/StrategyEngine';
import { StateStore } from './../state/StateStore';
import { AngelOneAdapter } from "../market/LiveMarketDataAdapter";
import { MockMarketDataAdapter } from "../market/MockMarketDataAdapter";
import { TriggerEngine } from '../engine/TriggerEngine';
import { PaperTrader } from '../paper/PaperTrader';
import { DbWriter } from '../db/DBWriter';
import { TriggerEvent } from '../engine/types';
import { TradeLogger } from '../logger/TradeLogger';
import { FileLogger } from '../logger/FileLogger';
import path from 'path';
import fs from "fs";
import { BhavCopyService } from '../market/BhavCopyService';
import { StockInfo, Tick } from '../market/types';
import { AppStateModel } from '../db/models/AppState.model';

export class MarketSession {
    private isRunning: boolean = false;
    private adapter: MockMarketDataAdapter | AngelOneAdapter | null = null;

    public stateStore: StateStore;
    private strategyEngine: StrategyEngine;
    private triggerEngine: TriggerEngine;
    private paperTrader: PaperTrader;
    private dbWriter: DbWriter;
    private triggerLogger: FileLogger<TriggerEvent>;
    private tradeLogger: TradeLogger;


    public constructor() {
        this.stateStore = new StateStore();
        this.strategyEngine = new StrategyEngine();
        this.triggerEngine = new TriggerEngine(this.stateStore, this.strategyEngine);
        this.paperTrader = new PaperTrader();
        this.dbWriter = new DbWriter();

        const dateStr = new Date().toISOString().slice(0, 10);
        this.triggerLogger = new FileLogger<TriggerEvent>(`triggers_${dateStr}.log`);
        this.tradeLogger = new TradeLogger(`trades_${dateStr}.log`);
    }

    async start(credentials: AngelCredentials): Promise<void> {
        if (this.isRunning) {
            console.log("Session already running");
            return;
        }

        console.log("Starting Market Session...");

        // 1. Load Configs
        const settingsConfig = JSON.parse(fs.readFileSync(path.join(__dirname, "../../config/settings.json"), "utf-8"));
        const stocksConfig = JSON.parse(fs.readFileSync(path.join(__dirname, "../../config/tokenMaster.json"), "utf-8"));

        // 2. Initialize Market State (Prices)
        await this.initializeState(stocksConfig);

        // const bhavCopyService = new BhavCopyService();
        // const closingPriceMap = await bhavCopyService.loadClosingPrices(stocksConfig);

        // stocksConfig.filter((stock: StockInfo) => stock.symbol != "SENSEX").forEach((stock: StockInfo) => {
        //     const price = closingPriceMap[stock.symbol] || 0;
        //     this.stateStore.initStock(stock.symbol, price);
        // });

        // this.stateStore.initSensex(closingPriceMap['SENSEX'] || 0);
        const environment = process.env.APP_ENV || settingsConfig.environment || "MOCK";

        console.log("ENVIRONMENT:", environment);

        if (environment === "MOCK") {
            this.adapter = new MockMarketDataAdapter(this.stateStore.getSensex(), this.stateStore.getAllStocks());
            this.adapter.start();
        } else {
            this.adapter = new AngelOneAdapter(stocksConfig);
            await this.adapter.connect(credentials);
            this.adapter.subscribe();
        }

        this.adapter.onTick((tick: Tick) => this.handleTick(tick));
        this.isRunning = true;
        console.log("Market Session Started Successfully");
    }

    private async initializeState(stocksConfig: StockInfo[]) {
        const bhavCopyService = new BhavCopyService();
        const closingPriceMap = await bhavCopyService.loadClosingPrices(stocksConfig);

        const savedState = await AppStateModel.findOne().sort({ timestamp: -1 });

        if (savedState) {
            console.log(`Loaded Saved State from ${savedState.timestamp}`);
            this.stateStore.loadSnapshot(savedState);

            const savedStockSymbols = new Set(savedState.stocks.map((s: any) => s.symbol));

            stocksConfig.filter(s => s.symbol !== "SENSEX").forEach(stock => {
                if (!savedStockSymbols.has(stock.symbol)) {
                    console.log(`🆕 New Stock detected: ${stock.symbol}, initializing from BhavCopy`);
                    const price = closingPriceMap[stock.symbol] || 0;
                    this.stateStore.initStock(stock.symbol, price);
                }
            });

        } else {
            console.log("No Saved State found. Initializing strictly from BhavCopy.");

            stocksConfig.filter((stock: StockInfo) => stock.symbol != "SENSEX").forEach((stock: StockInfo) => {
                const price = closingPriceMap[stock.symbol] || 0;
                this.stateStore.initStock(stock.symbol, price);
            });
            this.stateStore.initSensex(closingPriceMap['SENSEX'] || 0);
        }
    }

    private handleTick(tick: Tick) {
        let latestSensexPrice = 0;
        if (tick.symbol == "SENSEX") {
            latestSensexPrice = tick.price;
        } else {
            latestSensexPrice = this.stateStore.getSensex().currPrice;
        }

        const triggerEvent = this.triggerEngine.processTick(tick, latestSensexPrice);
        if (triggerEvent) {
            this.triggerLogger.log(triggerEvent);
            this.dbWriter.logTrigger(triggerEvent);
            const trade = this.paperTrader.handleEvent(triggerEvent);
            if (trade) {
                this.tradeLogger.log(trade);
                this.dbWriter.logTrade(trade);
                console.log("TRADE EXECUTED:", trade);
            }
        }
    }

    async stop(): Promise<void> {
        if (!this.isRunning) return;

        await this.saveState();

        if (this.adapter) {
            if (this.adapter instanceof AngelOneAdapter) {
                this.adapter.close();
            } else {
                this.adapter.stop();
            }
        }

        this.isRunning = false;
        console.log("Market session stopped");
    }

    async saveState() {
        try {
            const snapshot = this.stateStore.toJSON();
            console.log(snapshot)
            await AppStateModel.create(snapshot);
            console.log("System State Saved to DB");
        } catch (err) {
            console.error("Failed to save state:", err);
        }
    }

    isMarketRunning(): boolean {
        return this.isRunning;
    }
}