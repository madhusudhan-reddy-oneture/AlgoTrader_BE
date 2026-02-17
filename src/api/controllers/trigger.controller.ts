import { Request, Response } from 'express';
import { TriggerModel } from '../../db/models/Trigger.model';

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

      const matchQuery: any = {};
      if (actionsParam) {
        const actions = actionsParam.split(',');
        matchQuery.action = { $in: actions };
      }

      const skip = page * limit;

      const items = await TriggerModel.aggregate([
        { $match: matchQuery },

        { $sort: { timestamp: -1 } },

        {
          $group: {
            _id: "$symbol",
            latestDoc: { $first: "$$ROOT" }
          }
        },

        { $replaceRoot: { newRoot: "$latestDoc" } },

        { $sort: { symbol: 1 } },

        { $skip: skip },
        { $limit: limit }
      ]);

      const uniqueSymbols = await TriggerModel.find(matchQuery).distinct('symbol');
      const total = uniqueSymbols.length;

      res.json({ items, total })
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Failed to fetch triggers' });
    }

  }
}
