import { createOpenAI } from '@ai-sdk/openai';
import { streamText } from 'ai';

const openaiSdk = createOpenAI({
  apiKey: process.env.FRIDAY_API_KEY,
  baseURL: 'https://aigc.sankuai.com/v1/openai/native/',
});

// 2. streamText - 流式文本生成（你已经在用）
// 基础流式
export async function streamTextDemo(prompt: string) {
  const result = await streamText({
    model: openaiSdk('gpt-4o-mini'),
    prompt: '写一首关于编程的诗',
  });

  for await (const textPart of result.textStream) {
    console.log(textPart);
  }
}

// 带回调的流式（更好的控制）
export async function streamTextWithCallbackDemo(prompt: string) {
  const result = await streamText({
    model: openaiSdk('gpt-4o-mini'),
    prompt: '解释React的工作原理',
    onChunk({ chunk }) {
      // @ts-ignore
      console.log('接收到:', chunk.textDelta);
    },
    onFinish({ text, usage }) {
      console.log('完成，总计:', text.length, '字符');
      console.log('Token使用:', usage);
    },
  });
}
