/**
 * 🔧 高级用法示例
 * 5. 组合使用多个 hooks
 */

import { useChat, useCompletion, useObject } from '@ai-sdk/react';
import { useState } from 'react';
import { z } from 'zod';

const MultiHookComponent = () => {
  const [mode, setMode] = useState<'chat' | 'completion' | 'object'>('chat');

  // 聊天模式
  const chat = useChat({
    api: 'http://localhost:8080/api/chat',
  });

  // 文本生成模式
  const completion = useCompletion({
    api: 'http://localhost:8080/api/completion',
  });

  // 结构化生成模式
  const objectGen = useObject({
    api: 'http://localhost:8080/api/object',
    schema: z.object({
      summary: z.string(),
      keywords: z.array(z.string()),
    }),
  });

  return (
    <div className='space-y-4'>
      {/* 模式切换 */}
      <div className='flex gap-2'>
        {(['chat', 'completion', 'object'] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`px-4 py-2 rounded ${
              mode === m ? 'bg-blue-500 text-white' : 'bg-gray-200'
            }`}
          >
            {m}
          </button>
        ))}
      </div>

      {/* 根据模式渲染不同组件 */}
      {mode === 'chat' && (
        <div>
          {/* 聊天界面 */}
          <div className='space-y-2'>
            {chat.messages.map((msg) => (
              <div key={msg.id}>{msg.content}</div>
            ))}
          </div>
          <form onSubmit={chat.handleSubmit}>
            <input value={chat.input} onChange={chat.handleInputChange} />
            <button type='submit'>发送</button>
          </form>
        </div>
      )}

      {mode === 'completion' && (
        <div>
          {/* 文本生成界面 */}
          <form onSubmit={completion.handleSubmit}>
            <textarea
              value={completion.input}
              onChange={completion.handleInputChange}
            />
            <button type='submit'>生成</button>
          </form>
          {completion.completion && (
            <div className='mt-4 p-4 bg-gray-100 rounded'>
              {completion.completion}
            </div>
          )}
        </div>
      )}

      {mode === 'object' && (
        <div>
          {/* 结构化生成界面 */}
          <button onClick={() => objectGen.submit('分析这段文本')}>
            生成分析
          </button>
          {objectGen.object && (
            <div className='mt-4 p-4 bg-gray-100 rounded'>
              <p>摘要: {objectGen.object.summary}</p>
              <p>关键词: {objectGen.object.keywords?.join(', ')}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MultiHookComponent;
