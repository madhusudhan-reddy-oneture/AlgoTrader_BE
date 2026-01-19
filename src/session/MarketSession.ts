export class MarketSession {
    private marketOpenDelayMin: number;
    private isRunning: boolean = false;

    public constructor(marketOpenDelayMin: number) {
        this.marketOpenDelayMin = marketOpenDelayMin;
    }

    async start(): Promise<void> {
        // console.log("⏳ Waiting for market open delay...");

        // await this.delay(this.marketOpenDelayMin * 60 * 1000);

        this.isRunning = true;
        console.log("Market session started");
    }

    stop(): void {
        this.isRunning = false;
        console.log("📉 Market session stopped");
    }

    isMarketRunning(): boolean {
        return this.isRunning;
    }

    private delay(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
}