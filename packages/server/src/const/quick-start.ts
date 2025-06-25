import { generateText, streamText, generateObject } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';

const openai = createOpenAI({
  apiKey: process.env.FRIDAY_API_KEY,
  baseURL: 'https://aigc.sankuai.com/v1/openai/native/',
});

// 1. 先掌握这4个核心API
const coreAPIs = {
  generateText, // 基础文本生成
  streamText, // 流式文本（你已掌握）
  generateObject, // 结构化输出
  // 工具调用（进阶）
};

// 2. 常用配置模式
const commonConfig = {
  model: openai('gpt-4o-mini'),
  temperature: 0.7, // 创造性 0-1
  maxTokens: 1000, // 限制输出长度
  topP: 0.9, // 采样参数
};

// 3. 错误处理模板
const handleAIError = (error: any) => {
  if (error.code === 'rate_limit_exceeded') {
    return '请求过于频繁，请稍后再试';
  }
  if (error.code === 'insufficient_quota') {
    return 'API配额不足';
  }
  return '服务暂时不可用';
};
