import fs from 'fs';
const { WebSocketV2 } = require("smartapi-javascript");
import { getAngelFeedToken } from "./auth";
import { Tick, StockInfo, AngelCredentials } from "./types";

const ACTION = {
    Subscribe: 1,
};

const MODE = {
    LTP: 1,
};

const EXCHANGE = {
    NSE: 1,
    BSE: 3,
};

export class AngelOneAdapter {
    private ws!: any;
    private listeners: Array<(tick: Tick) => void> = [];
    private tokenMap: Record<string, StockInfo> = {};


    constructor(private stocks: StockInfo[]) {
        stocks.forEach(s => {
            this.tokenMap[s.token] = s;
        });
    }

    async connect(credentials: AngelCredentials): Promise<void> {
        const session = await getAngelFeedToken(credentials);

        this.ws = new WebSocketV2({
            clientcode: credentials.clientId, //"A768340",
            jwttoken: session.jwtToken,
            apikey: credentials.apiKey, //"omT0j1lA",
            feedtype: session.feedToken,
        });


        await this.ws.connect();

        this.ws.on("tick", (tickData: any) => {
            if (!tickData?.token || !tickData?.last_traded_price) return;

            // this.tickStream.write(JSON.stringify(tickData) + "\n");
            const token = tickData.token.replace(/"/g, "");
            const stock = this.tokenMap[token];

            const price = Number(tickData.last_traded_price) / 100;

            const tick: Tick = {
                symbol: stock.symbol,
                price,
                timestamp: Date.now(),
            };

            console.log(token, stock.symbol, `→ ₹${price}`);

            this.listeners.forEach((cb) => cb(tick));
        });
    }

    subscribe(): void {
        // ---- NSE tokens (stocks)
        const nseTokens = Object.keys(this.tokenMap).filter(
            (t) => t !== "99919000"
        );

        // ---- Subscribe NSE stocks
        this.ws.fetchData({
            action: ACTION.Subscribe,
            mode: MODE.LTP,
            exchangeType: EXCHANGE.NSE,
            tokens: nseTokens,
        });

        // ----Subscribe SENSEX(BSE)
        this.ws.fetchData({
            action: ACTION.Subscribe,
            mode: MODE.LTP,
            exchangeType: EXCHANGE.BSE,
            tokens: [99919000],
        });
    }

    onTick(cb: (tick: Tick) => void): void {
        this.listeners.push(cb);
    }

    close(): void {
        this.ws?.close();
        console.log(" WebSocket closed");
    }
}