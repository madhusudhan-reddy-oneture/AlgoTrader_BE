import { WebSocket } from "ws";
import { TriggerEvent } from "../engine/types";
import { Trade } from "../paper/types";
import { EventBus } from "../events/EventBus";
import { SensexState, StockState } from "../state/types";
import { Tick } from "../market/types";
import { Server } from "http";

export function startWebSocketServer(server: Server) {
    const wss = new WebSocket.Server({ server });

    console.log(`Websocket running on`);

    wss.on("connection", (ws) => {
        ws.send(JSON.stringify({
            type: "CONNECTED",
            message: "Connected to AlgoTrader WS"
        }));

        const triggerHandler = (triggerEvent: TriggerEvent) => {
            ws.send(JSON.stringify({
                type: "TRIGGER",
                payload: triggerEvent
            }))
        };

        const tradeHandler = (trade: Trade) => {
            ws.send(JSON.stringify({
                type: "TRADE",
                payload: trade
            }))
        };

        const sensexUpdateHandler = (sensex: SensexState) => {
            ws.send(JSON.stringify({
                type: 'SENSEXUPDATE',
                payload: sensex
            }));
        };

        const stockUpdateHandler = (stock: StockState) => {
            ws.send(JSON.stringify({
                type: 'STOCKUPDATE',
                payload: stock
            }));
        };

        EventBus.on("trigger", triggerHandler);
        EventBus.on("trade", tradeHandler);
        EventBus.on("stockUpdate", stockUpdateHandler);
        EventBus.on("sensexUpdate", sensexUpdateHandler);

        ws.on("close", () => {
            EventBus.off("trigger", triggerHandler);
            EventBus.off("trade", tradeHandler);
        })
    })
}