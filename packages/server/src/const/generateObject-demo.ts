// 🏗️ 结构化输出 API
// 3. generateObject - 生成结构化数据
import { createOpenAI } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { z } from 'zod';
import { Hono } from 'hono';

const openaiSdk = createOpenAI({
  apiKey: process.env.FRIDAY_API_KEY,
  baseURL: 'https://aigc.sankuai.com/v1/openai/native/',
});

const app = new Hono();

// 生成商品信息
const productSchema = z.object({
  title: z.string(),
  price: z.number(),
  category: z.enum(['electronics', 'clothing', 'books']),
  features: z.array(z.string()),
  rating: z.number().min(1).max(5),
});

export async function generateObjectDemo(prompt: string) {
  const { object } = await generateObject({
    model: openaiSdk('gpt-4o-mini'),
    schema: z.object({
      name: z.string(),
      age: z.number(),
      skills: z.array(z.string()),
      bio: z.string(),
    }),
    prompt: `基于这个描述生成用户资料: ${prompt}`,
    // schema: productSchema,
    // prompt: '生成一个智能手机的商品信息',
  });
  return object;
}

// 生成用户资料
app.post('/api/generate-profile', async (c) => {
  const { description } = await c.req.json();

  const { object } = await generateObject({
    model: openaiSdk('gpt-4o-mini'),
    schema: z.object({
      name: z.string(),
      age: z.number(),
      skills: z.array(z.string()),
      bio: z.string(),
    }),
    prompt: `基于这个描述生成用户资料: ${description}`,
  });

  return c.json(object);
  // 返回: { name: "张三", age: 25, skills: ["JavaScript", "React"], bio: "..." }
});
