// 基于 hono.js 的 server 应用
import { Hono } from 'hono';
import { stream as honoStream } from 'hono/streaming';
import { streamText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';

const openai = createOpenAI({
  apiKey: process.env.FRIDAY_API_KEY,
  baseURL: 'https://aigc.sankuai.com/v1/openai/native/',
});

const app = new Hono();

app.get('/', (c) => c.text('Hello World'));

app.post('/api/agent/hono-stream', async (c) => {
  const result = streamText({
    model: openai('gpt-4o-mini'),
    messages: [{ role: 'user', content: '你是谁' }],
    onChunk: (chunk) => {
      console.log('onChunk: ', chunk.chunk.textDelta);
    },
    onFinish: () => {
      console.log('onFinish');
    },
    onError: (error) => {
      console.log('onError: ', error);
    },
  });

  return honoStream(c, (s) => s.pipe(result.toDataStream()));
});

app.post('/api/agent/test', async (c) => {
  const { message } = await c.req.json();
  return c.json({ message });
});

export default app;
