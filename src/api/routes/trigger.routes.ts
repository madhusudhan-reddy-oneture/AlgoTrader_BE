import { Router } from 'express';
import { TriggerController } from '../controllers/trigger.controller';

const router = Router();

router.get('/', TriggerController.getAllTriggers);
router.get('/latestTriggers', TriggerController.getLatestTriggersByStock);
router.get('/:symbol', TriggerController.getTriggers);

export default router;
