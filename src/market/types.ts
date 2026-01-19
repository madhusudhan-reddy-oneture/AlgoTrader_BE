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

