// apps/server/src/index.ts
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 8000;

// 中间件
app.use(
  cors({
    origin: [
      'http://localhost:3000', // 保留，以防万一
      'http://localhost:5173', // <-- 为 Vite 添加
      'http://localhost:8000', // <-- 为 Vite 添加
    ],
  })
); // 允许前端访问
app.use(express.json());

// --- 在这里引入共享类型 ---
// import type { AgentResponse } from '@my-ai-agent/types';

app.get('/', (req, res) => {
  res.send('Hello From AI Agent Backend (Node.js)');
});

app.post('/api/v1/agent/invoke', (req, res) => {
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
  console.log(`[后端服务]: Server is running at http://localhost:${port}`);
});
