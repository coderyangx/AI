// apps/server/src/index.ts
import express from 'express';
import cors from 'cors';
import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

console.log('环境变量', process.env.OPENAI_API_KEY);

const app = express();
const port = process.env.PORT || 8000;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
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

app.get('/', (req, res) => {
  res.send('Hello From AI Agent Backend (Node.js)');
});

app.post('/api/agent/chat', async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // 调用 OpenAI API
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo', // 使用性价比高的模型
      messages: [{ role: 'user', content: message }],
    });

    // AI 回复
    const aiResponse = completion.choices[0].message.content;

    // 响应前端
    res.status(200).json({ reply: aiResponse });
  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    res.status(500).json({ error: 'AI 服务出错了' });
  }
});

app.post('/api/agent/invoke', (req, res) => {
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
