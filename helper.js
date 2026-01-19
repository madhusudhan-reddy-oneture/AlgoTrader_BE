const fs = require('fs').promises;
const path = require('path');

async function filterStocksByExchange(inputFile) {
    try {
        // 1️⃣ Load the JSON file
        const data = await fs.readFile(inputFile, 'utf-8');
        const stocks = JSON.parse(data);

        // 2️⃣ Filter NSE stocks
        const nseStocks = stocks.filter(stock => stock.exch_seg === 'NSE');

        // 3️⃣ Filter BSE stocks
        const bseStocks = stocks.filter(stock => stock.exch_seg === 'BSE');

        // 4️⃣ Write NSE stocks to a new JSON file
        await fs.writeFile(
            path.join(__dirname, 'nse_stocks.json'),
            JSON.stringify(nseStocks, null, 4)
        );
        console.log(`NSE stocks saved to nse_stocks.json (count: ${nseStocks.length})`);

        // 5️⃣ Write BSE stocks to a new JSON file
        await fs.writeFile(
            path.join(__dirname, 'bse_stocks.json'),
            JSON.stringify(bseStocks, null, 4)
        );
        console.log(`BSE stocks saved to bse_stocks.json (count: ${bseStocks.length})`);
    } catch (err) {
        console.error('Error processing stocks:', err);
    }
}

// Usage
filterStocksByExchange("./config/OpenAPIScripMaster.json"); // replace 'stocks.json' with your actual file name
