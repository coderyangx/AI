/**
 * Cloudflare Worker 适配器
 * 这个文件将 Express 应用的主要功能适配到 Cloudflare Workers 环境
 */

import { Hono } from 'hono';
import { serveStatic } from 'hono/cloudflare-workers';
import OpenAI from 'openai';
import { createOpenAI } from '@ai-sdk/openai';
import { streamText } from 'ai';

// 在 Cloudflare Workers 环境中设置 API 密钥和环境
if (typeof process === 'undefined') {
  // @ts-ignore
  globalThis.process = { env: {} };
  // 设置 API 密钥
  // @ts-ignore
  process.env.FRIDAY_API_KEY = '21902918114338451458';
  // 设置其他环境变量
  // @ts-ignore
  process.env.PORT = '8080';
}

// 创建 Hono 应用作为适配器
const workerApp = new Hono();

// 创建 OpenAI 实例
const openai = new OpenAI({
  apiKey: process.env.FRIDAY_API_KEY,
  baseURL: 'https://aigc.sankuai.com/v1/openai/native/',
});

const openaiSdk = createOpenAI({
  apiKey: process.env.FRIDAY_API_KEY,
  baseURL: 'https://aigc.sankuai.com/v1/openai/native/',
});

// workerApp.use('/*', serveStatic());

// 实现主要的 API 端点
workerApp.post('/api/agent/chat', async (c) => {
  try {
    const { message } = await c.req.json();

    if (!message) {
      return c.json({ error: 'Message is required' }, 400);
    }

    // 调用 OpenAI API
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: message }],
      temperature: 0.2,
    });

    // AI 回复
    const aiResponse = completion.choices[0].message.content;

    // 响应前端
    return c.json({ message: aiResponse });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    console.error('AI 服务出错:', errorMessage);
    return c.json({ error: 'AI 服务出错了' }, 500);
  }
});

// 流式输出接口
workerApp.post('/api/agent/stream', async (c) => {
  try {
    const { message } = await c.req.json();

    if (!message) {
      return c.json({ error: 'Message is required' }, 400);
    }

    // 使用 ai-sdk 流式输出
    const result = streamText({
      model: openaiSdk('gpt-4o-mini'),
      messages: [{ role: 'user', content: message }],
    });

    return result.toDataStreamResponse({
      sendReasoning: true,
    });
  } catch (error) {
    console.error('流式输出错误:', error);
    return c.json({ error: 'AI 服务出错了' }, 500);
  }
});

// 测试接口
workerApp.post('/api/agent/test', async (c) => {
  const { message } = await c.req.json();

  if (!message) {
    return c.json({ error: 'Message is required' }, 400);
  }

  const responseText = `I am a Cloudflare Worker AI agent. You said: '${message}'`;
  return c.json({ response: responseText });
});

// 健康检查接口
workerApp.get('/api/health', (c) => {
  return c.json({
    status: 'ok',
    environment: 'cloudflare-worker',
    timestamp: new Date().toISOString(),
  });
});

// 根路径
workerApp.get('/', (c) => {
  return c.text('AI Server is running on Cloudflare Workers!');
});

// 导出 Cloudflare Worker 处理函数
export default {
  fetch: workerApp.fetch,
};
