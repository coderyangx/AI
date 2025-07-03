import OpenAI from 'openai';

// 创建 OpenAI 实例
const openai = new OpenAI({
  apiKey: '21902918114338451458',
  baseURL: 'https://aigc.sankuai.com/v1/openai/native/',
});

export async function onRequestPost({ request }) {
  try {
    const { message } = await request.json();

    if (!message) {
      return new Response(JSON.stringify({ error: 'Message is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 创建一个流式响应
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // 使用 OpenAI 流式 API
          const aiStream = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [{ role: 'user', content: message }],
            stream: true,
          });

          // 处理每个数据块
          for await (const chunk of aiStream) {
            const content = chunk.choices[0]?.delta?.content || '';
            if (content) {
              // 发送 SSE 格式数据
              const data = `data: ${JSON.stringify({ content })}\n\n`;
              controller.enqueue(new TextEncoder().encode(data));
            }
          }

          // 发送结束标记
          controller.enqueue(new TextEncoder().encode('data: [DONE]\n\n'));
          controller.close();
        } catch (error) {
          // 处理错误
          const errorData = `data: ${JSON.stringify({
            error: 'AI 服务出错了',
          })}\n\n`;
          controller.enqueue(new TextEncoder().encode(errorData));
          controller.close();
        }
      },
    });

    // 返回流式响应
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (error) {
    console.error('流式输出错误:', error);
    return new Response(JSON.stringify({ error: 'AI 服务出错了' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
