// 🛠️ 工具调用 API
// 4. Tools & Function Calling
import { createOpenAI } from '@ai-sdk/openai';
import { generateText, streamText, generateObject } from 'ai';
import { z } from 'zod';
import { Hono } from 'hono';
import { logger } from '../utils/log';

const openaiSdk = createOpenAI({
  apiKey: process.env.FRIDAY_API_KEY,
  baseURL: 'https://aigc.sankuai.com/v1/openai/native/',
});

const app = new Hono();

// 定义工具
const weatherTool = {
  description: '获取天气信息',
  parameters: z.object({
    city: z.string().describe('城市名称'),
  }),
  execute: async ({ city }: { city: string }) => {
    // 模拟天气API调用
    return {
      city,
      temperature: Math.floor(Math.random() * 30) + 10,
      condition: '晴天',
    };
  },
};

// 使用工具的对话
app.post('/api/chat-with-tools', async (c) => {
  const { message } = await c.req.json();
  const result = await generateText({
    model: openaiSdk('gpt-4o-mini'),
    tools: {
      getWeather: weatherTool,
    },
    messages: [{ role: 'user', content: message }],
  });

  return c.json({ response: result.text });
});

// 流式工具调用
export async function streamTextWithToolsDemo(prompt: string) {
  const result = await streamText({
    model: openaiSdk('gpt-4o-mini'),
    tools: {
      getWeather: weatherTool,
      getTime: {
        description: '获取当前时间',
        parameters: z.object({}),
        execute: async () => ({ time: new Date().toISOString() }),
      },
    },
    prompt: '今天北京天气怎么样？现在几点了？',
    onChunk({ chunk }) {
      if (chunk.type === 'tool-call') {
        console.log('调用工具:', chunk.toolName, chunk.args);
      }
    },
  });
}

/**
 * 💬 对话管理 API
 * 5. Messages & Chat History
 */
// 多轮对话
app.post('/api/chat-conversation', async (c) => {
  const { messages, newMessage } = await c.req.json();

  const conversationMessages = [
    { role: 'system', content: '你是一个友好的AI助手' },
    ...messages, // 历史消息
    { role: 'user', content: newMessage },
  ];

  const result = await streamText({
    model: openaiSdk('gpt-4o-mini'),
    messages: conversationMessages,
  });

  // 设置SSE响应
  c.header('Content-Type', 'text/event-stream');

  for await (const textPart of result.textStream) {
    c.write(`data: ${JSON.stringify({ content: textPart })}\n\n`);
  }

  c.write('data: [DONE]\n\n');
  c.end();
});

// 带上下文的对话
export async function generateTextWithContextDemo(prompt: string) {
  const { text } = await generateText({
    model: openaiSdk('gpt-4o-mini'),
    messages: [
      { role: 'system', content: '你是一个代码审查专家' },
      { role: 'user', content: '这段代码有什么问题？' },
      { role: 'user', content: 'function add(a, b) { return a + b }' },
    ],
  });
}

/**
 * ⚙️ 配置和错误处理
6. Provider Configuration
 */

// 多模型配置
const openaiProvider = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: 'https://aigc.sankuai.com/v1/openai/native/',
});

const anthropicProvider = createAnthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// 动态选择模型
app.post('/api/smart-chat', async (req, res) => {
  const { message, modelType = 'openai' } = req.body;

  const model =
    modelType === 'openai'
      ? openaiProvider('gpt-4o-mini')
      : anthropicProvider('claude-3-sonnet-20240229');

  const { text } = await generateText({
    model,
    prompt: message,
  });

  res.json({ response: text, usedModel: modelType });
});

// 错误处理和重试
app.post('/api/robust-chat', async (c) => {
  const { message } = await c.req.json();

  try {
    const { text } = await generateText({
      model: openaiSdk('gpt-4o-mini'),
      prompt: message,
      maxRetries: 3, // 自动重试
      abortSignal: AbortSignal.timeout(30000), // 30秒超时
    });

    return c.json({ response: text });
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      return c.status(408).json({ error: '请求超时' });
    } else {
      return c.status(500).json({ error: 'AI服务异常' });
    }
  }
});

/**
 * 📊 使用监控和调试
 * 7. Usage Tracking & Debugging
 */

// 使用监控
// 监控Token使用
export async function generateTextWithUsageTrackingDemo(prompt: string) {
  const result = await generateText({
    model: openaiSdk('gpt-4o-mini'),
    prompt: '写一篇关于AI的文章',
    onFinish({ usage, text }) {
      console.log('Token使用情况:', {
        prompt: usage.promptTokens,
        completion: usage.completionTokens,
        total: usage.totalTokens,
      });

      // 记录到数据库或监控系统
      logger.info({
        type: 'ai-usage',
        tokens: usage.totalTokens,
        model: 'gpt-4o-mini',
        responseLength: text.length,
      });
    },
  });

  return result;
}

// 流式监控
export async function streamTextWithUsageTrackingDemo(prompt: string) {
  const result = await streamText({
    model: openaiSdk('gpt-4o-mini'),
    prompt: '详细解释量子计算',
    experimental_telemetry: {
      isEnabled: true,
      functionId: 'quantum-explanation',
    },
    onChunk({ chunk }) {
      // 实时监控
      console.log('Chunk received:', chunk.text?.length || 0, 'chars');
    },
    onFinish({ usage }) {
      console.log('Stream finished, total tokens:', usage.totalTokens);
    },
  });
  return result;
}

/**
 * 🔍 高级功能
 * 8. Advanced Features
 */

// 使用代理
export async function generateTextWithProxyDemo(prompt: string) {
  const result = await generateText({
    model: openaiSdk('gpt-4o-mini'),
    prompt: '写一篇关于AI的文章',
  });
  return result;
}
