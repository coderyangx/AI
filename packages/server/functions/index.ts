export function onRequestGet() {
  return new Response(
    `<!DOCTYPE html>
    <html>
      <head>
        <title>AI Agent API</title>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 2rem; }
          h1 { color: #0070f3; }
        </style>
      </head>
      <body>
        <h1>AI Agent API</h1>
        <p>这是 AI 服务的 API 端点。</p>
        <p>可用的 API 端点:</p>
        <ul>
          <li><code>/api/agent/chat</code> - 标准聊天 API</li>
          <li><code>/api/agent/stream</code> - 流式聊天 API</li>
          <li><code>/api/agent/test</code> - 测试 API</li>
          <li><code>/api/health</code> - 健康检查</li>
        </ul>
      </body>
    </html>`,
    {
      headers: { 'Content-Type': 'text/html;charset=UTF-8' },
    }
  );
}
