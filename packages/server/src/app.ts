// 基于 hono.js 的 server 应用
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { stream as honoStream } from 'hono/streaming';
import { z } from 'zod';
// import { zValidator } from '@hono/zod-validator';
import { streamText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import dotenv from 'dotenv';

dotenv.config();

const openai = createOpenAI({
  apiKey: process.env.FRIDAY_API_KEY,
  baseURL: 'https://aigc.sankuai.com/v1/openai/native/',
});

const app = new Hono();
app.use(cors());

// 生产环境
// app.use(
//   '/*',
//   cors({
//     origin: (origin) => {
//       // 动态判断是否允许该域名
//       const allowedOrigins = [
//         'http://localhost:3000',
//         'http://localhost:5173',
//         'http://localhost:8000',
//       ];
//       return allowedOrigins.includes(origin);
//     },
//     allowMethods: ['GET', 'POST'],
//     allowHeaders: ['Content-Type', 'Authorization'],
//     credentials: true,
//   })
// );

app.get('/', (c) => c.text('Hello World'));

app.post('/api/agent/stream', async (c) => {
  const { messages } = await c.req.json();
  const result = streamText({
    model: openai('gpt-4o-mini'),
    messages: messages,
    onChunk: (chunk) => {
      // @ts-ignore
      console.log('hono onChunk: ', chunk.chunk.textDelta);
    },
    // onFinish: () => {
    //   console.log('onFinish');
    // },
    // onError: (error) => {
    //   console.log('onError: ', error);
    // },
  });
  return result.toDataStreamResponse({
    sendReasoning: true,
  }); // 标准 sse 响应
  // return result.toTextStreamResponse(); // 纯文本流响应
  // return honoStream(c, (s) => s.pipe(result.toDataStream()));
});

app.post('/api/agent/test', async (c) => {
  const { messages } = await c.req.json(); // 前端使用 useChat 时，接收 messages
  const lastMessage = messages[messages.length - 1];
  const userContent = lastMessage?.content || '';

  console.log('用户输入:', userContent);
  return c.json({
    role: 'assistant',
    content: `I am a Hono AI agent. You said: '${userContent}'`,
  });
});

// const userSchema = z.object({
//   name: z.string().min(1),
//   age: z.number(),
// });
// app.post(
//   '/api/agent/zod-validator',
//   zValidator('json', userSchema, (res, c) => {
//     if (!res.success) {
//       return c.text('Invalid!', 400);
//     }
//   }),
//   async (c) => {
//     const { name, age } = c.req.valid('json');
//     return c.json({
//       message: 'Hello World',
//     });
//   }
// );

export default app;

// serve(
//   {
//     fetch: app.fetch,
//     port: process.env.NODE_PORT ? Number(process.env.NODE_PORT) : 8000,
//   },
//   (info) => {
//     console.log(`Server is running on http://localhost:${info.port}`);
//   }
// );
