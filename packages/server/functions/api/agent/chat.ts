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

    // 调用 OpenAI API
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: message }],
      temperature: 0.2,
    });

    // AI 回复
    const aiResponse = completion.choices[0].message.content;

    // 响应前端
    return new Response(JSON.stringify({ message: aiResponse }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('AI 服务出错:', error);
    return new Response(JSON.stringify({ error: 'AI 服务出错了' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
