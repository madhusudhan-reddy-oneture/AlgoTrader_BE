import { Router } from 'express';
import tradeRoutes from './trade.routes';
import triggerRoutes from './trigger.routes';

const router = Router();

router.use('/trades', tradeRoutes);
router.use('/triggers', triggerRoutes);

export default router;
