import { Request, Response } from 'express';
import { TriggerModel } from '../../db/models/Trigger.model';
import { marketSession } from './session.controller';

export class TriggerController {

  static async getAllTriggers(req: Request, res: Response) {
    try {

      const page = Number(req.query.page ?? 0);
      const limit = Number(req.query.limit ?? 0);
      const actionsParam = req.query.actions as string | undefined;
      const symbolsParam = req.query.symbols as string | undefined;

      const query: any = {};

      if (symbolsParam) {
        query.symbol = symbolsParam.split(',');
      }

      if (actionsParam) {
        const actions = actionsParam.split(',');
        query.action = actions;
      }

      const skip = page * limit;

      const [items, total] = await Promise.all([
        TriggerModel
          .find(query)
          .sort({ timestamp: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),

        TriggerModel.countDocuments(query)
      ])

      res.json({ items, total })
    }
    catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Failed to fetch triggers' });
    }

  }

  static async getTriggers(req: Request, res: Response) {
    try {
      const symbol = req.params.symbol;
      const page = Number(req.query.page ?? 0);
      const limit = Number(req.query.limit ?? 10);
      const actionsParam = req.query.actions as string | undefined;

      if (!symbol) {
        return res.status(400).json({ message: 'symbol is required' });
      }

      const query: any = { symbol };

      if (actionsParam) {
        const actions = actionsParam.split(',');
        query.action = { $in: actions };
      }

      const skip = page * limit;

      const [items, total] = await Promise.all([
        TriggerModel
          .find(query)
          .sort({ timestamp: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),

        TriggerModel.countDocuments(query)
      ]);

      res.json({ items, total });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Failed to fetch triggers' });
    }
  }

  static async getLatestTriggersByStock(req: Request, res: Response) {
    try {
      const page = Number(req.query.page ?? 0);
      const limit = Number(req.query.limit ?? 0);
      const actionsParam = req.query.actons as string | undefined;

      const latestTriggeres = await TriggerModel.aggregate([
        {$sort: { timestamp: -1 }},
        {$group: {
          _id: '$symbol',
          latestDoc: { $first: '$$ROOT' }
        }},
        {$replaceRoot: { newRoot: '$latestDoc' }},

      ]);

      const triggerMap = new Map();
      latestTriggeres.forEach((trigger) => {
        triggerMap.set(trigger.symbol, trigger);
      })

      const activeStocksMap = marketSession.stateStore.getAllStocks();

      const allSymbols = new Set([
        ...Array.from(activeStocksMap.keys()),
        ...triggerMap.keys()
      ])

      let combonedList = Array.from(allSymbols).map(symbol => {
        const activeStock = activeStocksMap.get(symbol);
        const trigger = triggerMap.get(symbol);

        const currentPrice = activeStock ? activeStock.currPrice : (trigger ? trigger.stockPrice : 0);
        const basePrice = activeStock ? activeStock.basePrice : (trigger ? trigger.lastStockPrice : 0);

        if(trigger) {
          return trigger;
        }
        else{
          return {
            symbol,
            action: "-",
            stockPrice: currentPrice,
            lastStockPrice: basePrice,
            sensexPrice: null,

            lastSensexPrice: null,

            stockDirection: "-",
            sensexDirection: "-",

            timestamp: null
          };
        }
      });

      if(actionsParam) {
        const actions = actionsParam.split(',');
        combonedList = combonedList.filter(item => actions.includes(item.action));
      }

      const total = combonedList.length;
      const start = page * limit;
      const end = start + limit;
      const items = combonedList.slice(start, end);
      

      res.json({ items, total })
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Failed to fetch triggers' });
    }

  }
}
