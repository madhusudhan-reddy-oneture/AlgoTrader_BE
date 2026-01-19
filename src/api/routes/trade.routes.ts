import { Router } from 'express';
import { TradeController } from '../controllers/trade.controller';

const router = Router();

router.get('/:symbol', TradeController.getTrades);

export default router;
