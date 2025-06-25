import { createOpenAI } from '@ai-sdk/openai';
import { generateText } from 'ai';

const openaiSdk = createOpenAI({
  apiKey: process.env.FRIDAY_API_KEY,
  baseURL: 'https://aigc.sankuai.com/v1/openai/native/',
});

// 1. generateText - 基础文本生成
// 基础对话生成
export async function generateTextDemo(prompt: string) {
  const { text } = await generateText({
    model: openaiSdk('gpt-4o-mini'),
    prompt,
    // 可选配置
    temperature: 0.7,
    maxTokens: 500,
  });

  return text;
}
// app.post('/api/generate', async (req, res) => {
//   const { prompt } = req.body;
//   const { text } = await generateText({
//     model: openaiSdk('gpt-4o-mini'),
//     prompt,
//     // 可选配置
//     temperature: 0.7,
//     maxTokens: 500,
//   });
//   res.json({ response: text });
// });

// 带系统提示的对话
export async function generateTextWithSystemDemo(prompt: string) {
  const { text } = await generateText({
    model: openaiSdk('gpt-4o-mini'),
    system: '你是一个专业的编程助手',
    prompt,
  });

  return text;
}


