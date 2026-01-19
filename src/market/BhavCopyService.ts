import fs from "fs";
import path from "path";
import { StockInfo } from "./types";

type PriceMap = Record<string, number>;

export class BhavCopyService {

    private basePath = path.join(__dirname, "../../config/bhav");

    public loadClosingPrices(stocks: StockInfo[]): PriceMap {
        const nseFilePath = path.join(this.basePath, "NSE_BhavCopy.csv");
        const nseCsv = fs.readFileSync(nseFilePath, "utf-8");
        const nseRows = this.parseCsv(nseCsv);

        const bseFilePath = path.join(this.basePath, "BSE_BhavCopy.csv");
        const bseCsv = fs.readFileSync(bseFilePath, "utf-8");
        const bseRows = this.parseCsv(bseCsv);

        const prices: PriceMap = {};

        const sensexRow = bseRows.find(
            r => r.IndexID === "SENSEX"
        );
        prices['SENSEX'] = Number(sensexRow.ClosePrice);

        stocks.forEach(stock => {
            const row = nseRows.find(r =>
                r.SERIES === "EQ" &&
                r.SYMBOL === stock.name
            );

            if (row) {
                prices[stock.symbol] = Number(row.CLOSE_PRICE);
            }
        });



        return prices;

    }

    private parseCsv(content: string): any[] {
        const lines = content
            .split(/\r?\n/)
            .map(l => l.trim())
            .filter(Boolean);

        const headers = lines[0].split(/\t|,/).map(h => h.trim());

        return lines.slice(1).map(line => {
            const values = line.split(/\t|,/);
            const row: any = {};
            headers.forEach((h, i) => {
                row[h] = values[i]?.trim();
            });
            return row;
        });
    }
}
