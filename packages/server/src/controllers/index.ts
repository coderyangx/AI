// 控制器层

import { Request, Response } from 'express';
import { testService } from '../services';

export const testController = async (req: Request, res: Response) => {
  const { message } = req.body;
  const response = await testService(message);
  res.json({ response });
};
