import fs from "fs";
import path from "path";

import { connectDB } from './db/connect';
import { startApiServer } from './api/server';
import { startWebSocketServer } from './ws/WebSocketServer';

import { MarketSession } from "./session/MarketSession";
import { StateStore } from "./state/StateStore";
import { StrategyEngine } from "./strategy/StrategyEngine";
import { TriggerEngine } from './engine/TriggerEngine';

import { BhavCopyService } from './market/BhavCopyService';
import { AngelOneAdapter } from './market/LiveMarketDataAdapter';
import { MockMarketDataAdapter } from './market/MockMarketDataAdapter';
import { PaperTrader } from './paper/PaperTrader';
import { FileLogger } from './logger/FileLogger';
import { TradeLogger } from './logger/TradeLogger';
import { DbWriter } from './db/DBWriter';

import { StockInfo, Tick } from './market/types';
import { TriggerEvent } from './engine/types';

import dotenv from 'dotenv';

dotenv.config();
const settingsConfig = JSON.parse(fs.readFileSync(path.join(__dirname, "../config/settings.json"), "utf-8"));
let stocksConfig = JSON.parse(fs.readFileSync(path.join(__dirname, "../config/tokenMaster.json"), "utf-8"));




async function bootstrap() {
    await connectDB();
    startApiServer();
    startWebSocketServer();

    const marketSession = new MarketSession(settingsConfig.marketOpenDelayMin);
    const stateStore = new StateStore();
    const strategyEngine = new StrategyEngine();
    const triggerEngine = new TriggerEngine(stateStore, strategyEngine);

    const paperTrader = new PaperTrader();
    const dbWriter = new DbWriter();

    const triggerLogger = new FileLogger<TriggerEvent>(`triggers_${new Date().toISOString().slice(0, 10)}.log`)
    const tradeLogger = new TradeLogger(`trades_${new Date().toISOString().slice(0, 10)}.log`)

    const bhavCopyService = new BhavCopyService();
    const closingPriceMap = await bhavCopyService.loadClosingPrices(stocksConfig)

    stocksConfig.filter((stock: StockInfo) => stock.symbol != "SENSEX").forEach((stock: StockInfo) => {
        const price = closingPriceMap[stock.symbol];
        stateStore.initStock(stock.symbol, price)
    })

    stateStore.initSensex(closingPriceMap['SENSEX']);

    await marketSession.start();


    let latestSensexPrice = 0;
    console.log("ENVIRONMENT ", settingsConfig.environment)

    if (settingsConfig.environment == "MOCK") {
        const adapter = new MockMarketDataAdapter(stateStore.getSensex(), stateStore.getAllStocks());
        adapter.start();
        adapter.onTick((tick: Tick) => {
            handleTick(tick);
        })
    }
    else {
        const adapter = new AngelOneAdapter(stocksConfig);
        await adapter.connect();
        adapter.subscribe();

        adapter.onTick((tick: Tick) => {
            handleTick(tick);
        })
    }

    function handleTick(tick: Tick) {
        if (tick.symbol == "SENSEX") {
            latestSensexPrice = tick.price;
        }

        const triggerEvent = triggerEngine.processTick(tick, latestSensexPrice);
        if (triggerEvent) {
            triggerLogger.log(triggerEvent)
            dbWriter.logTrigger(triggerEvent);
            const trade = paperTrader.handleEvent(triggerEvent);
            if (trade) {
                tradeLogger.log(trade)
                dbWriter.logTrade(trade);
                console.log(trade)
            }
        }
        console.log("*******************************\n")
    }
}

bootstrap();

