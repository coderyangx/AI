// 大模型路由

import { Router } from 'express';
import { testController } from '../controllers';

const router = Router();

router.post('/chat', testController);

export default router;
