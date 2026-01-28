export interface AngelCredentials {
    apiKey: string;
    clientId: string;
    password: string;
    totp: string;
}
export interface Tick {
    symbol: string,
    price: number,
    timestamp: number
}
export interface StockInfo {
    token: string;
    symbol: string;
    name: string;
    exch_seg: "NSE" | "BSE";
}

