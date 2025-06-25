// 路由层
import { Router } from 'express';
import agentRouter from './agent';

const router = Router();

router.use('/agent', agentRouter);

export default router;
