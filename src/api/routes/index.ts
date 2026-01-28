import { Router } from 'express';
import tradeRoutes from './trade.routes';
import triggerRoutes from './trigger.routes';
import sessionRoutes from './session.routes';

const router = Router();

router.use('/trades', tradeRoutes);
router.use('/triggers', triggerRoutes);
router.use('/session', sessionRoutes);

export default router;
