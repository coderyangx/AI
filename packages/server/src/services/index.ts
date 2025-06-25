// 业务层逻辑

import { logger } from '../utils/log';

export const testService = async (message: string) => {
  logger.info({
    type: 'test-service',
    message,
  });
};
