// apps/server/src/index.ts
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import OpenAI from 'openai';
import { z } from 'zod';
import { createOpenAI } from '@ai-sdk/openai';
import { streamText, generateObject, generateText } from 'ai';
import dotenv from 'dotenv';

dotenv.config();

// console.log('环境变量', process.env.OPENAI_API_KEY);

const app = express();
const port = process.env.PORT || 8000;

const openai = new OpenAI({
  // 修改friday-key
  apiKey: process.env.FRIDAY_API_KEY,
  baseURL: 'https://aigc.sankuai.com/v1/openai/native/',
  // https://aigc.sankuai.com/v1/openai/native/chat/completions
});

// 中间件
app.use(
  cors({
    origin: [
      'http://localhost:3000', // 保留，以防万一
      'http://localhost:5173', // <-- 为 Vite 添加
      'http://localhost:8000', // <-- 为 Vite 添加
    ],
  })
);
app.use(express.json()); // 解析请求体中的json数据

app.get('/', (req: Request, res: Response) => {
  res.send('Hello From AI Agent Backend (Node.js)');
});

// 普通对话接口
app.post('/api/agent/chat', async (req: Request, res: Response) => {
  try {
    const { message } = req.body;
    const cookies = req.headers['Cookie'];
    console.log('cookies: ', cookies);

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // 调用 OpenAI API
    const completion = await openai.chat.completions.create({
      // model: 'gpt-3.5-turbo', // 使用性价比高的模型
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: message }],
      temperature: 0.2,
      // top_p: 0.2,
      // stream: true,
      // tool_choice: 'auto',
      // tools: [
      //   {
      //     type: 'function',
      //     function: {
      //       name: 'get_current_time',
      //       description: 'Get the current time',
      //       parameters: {
      //         type: 'object',
      //         properties: { time: { type: 'string', description: 'The current time' } },
      //         required: ['time'],
      //       },
      //       strict: true,
      //       // execute: async (args) => {
      //       //   return { time: new Date().toISOString() };
      //       // },
      //     },
      //   },
      // ],
    });

    // AI 回复
    const aiResponse = completion.choices[0].message.content;
    // 响应前端
    res.status(200).json({ message: aiResponse });
  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    res.status(500).json({ error: 'AI 服务出错了' });
  }
});

// 流式输出接口
app.post('/api/agent/stream', async (req: Request, res: Response) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: '消息内容不能为空' });
    }

    // 设置响应头
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // 创建请求
    const stream = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: message }],
      stream: true,
    });

    // 处理响应
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      console.log('大模型输出: ', content);
      if (content) {
        // 发送数据
        res.write(`data: ${JSON.stringify({ content })}\n\n`);
      }
    }

    // 结束流
    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error) {
    console.error('流式输出错误:', error);
    // 如果连接仍然打开，发送错误消息
    if (!res.headersSent) {
      res.status(500).json({ error: 'AI 服务出错了' });
    } else {
      res.write(`data: ${JSON.stringify({ error: 'AI 服务出错了' })}\n\n`);
      res.end();
    }
  }
});

// 测试接口
app.post('/api/agent/test', (req: Request, res: Response) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  console.log(`Received prompt: ${prompt}`);
  // 这里是未来调用你的 AI Agent 逻辑的地方
  // const agentResponse = await myAgent.run(prompt);

  const responseText = `I am a Node.js AI agent. You said: '${prompt}'`;

  // const response: AgentResponse = { response: responseText };
  // res.json(response);
  res.json({ response: responseText });
});

app.listen(port, () => {
  console.log(`✅[后端服务]: is running at http://localhost:${port}`);
});
