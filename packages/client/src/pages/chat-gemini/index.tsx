import React from 'react';
import { useChat } from '@ai-sdk/react';
import { cn } from '@/utils/cn';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Bot, User, Copy, ThumbsUp, ThumbsDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ChatInput from './ChatInput';
import MessageBubble from './MessageBuble';

// interface Message {
//   id: string;
//   role: 'user' | 'assistant' | 'system' | 'tool';
//   content: string;
//   createdAt?: Date;
// }

export default function ChatGemini() {
  const { messages, input, handleInputChange, handleSubmit, isLoading, error } =
    useChat({
      api: 'http://localhost:8080/api/agent/stream',
      streamProtocol: 'data',
    });

  // 复制消息内容
  const copyMessage = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      // 这里可以添加toast提示
    } catch (err) {
      console.error('复制失败:', err);
    }
  };

  return (
    <div className='flex flex-col h-full max-w-4xl mx-auto bg-white'>
      {/* 聊天头部 */}
      <div className='flex items-center justify-between p-4 border-b bg-gray-50/50'>
        <div className='flex items-center gap-3'>
          <div className='flex items-center gap-2'>
            <Bot className='h-6 w-6 text-blue-500' />
            <h1 className='text-lg font-semibold text-gray-900'>AI 助手</h1>
          </div>
          <div className='h-2 w-2 bg-green-500 rounded-full animate-pulse' />
        </div>

        {/* 状态指示 */}
        <div className='text-sm text-gray-500'>
          {isLoading && '正在输入中...'}
        </div>
      </div>

      {/* 消息列表 */}
      <ScrollArea className='flex-1 p-4'>
        <div className='space-y-6'>
          {messages.length === 0 ? (
            // 欢迎界面
            <div className='text-center py-12'>
              <Bot className='h-12 w-12 text-primary mx-auto mb-4' />
              <h2 className='text-xl font-semibold text-foreground mb-2'>
                欢迎使用 AI 助手
              </h2>
              <p className='text-muted-foreground'>
                我可以帮助你解答问题、创作内容、编程协助等。请开始对话吧！
              </p>
            </div>
          ) : (
            messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                onCopy={copyMessage}
              />
            ))
          )}

          {/* 错误提示 */}
          {error && (
            <div className='bg-red-50 border border-red-200 rounded-lg p-3'>
              <p className='text-red-600 text-sm'>发生错误: {error.message}</p>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* 输入区域 */}
      <div className='p-4 border-t bg-gray-50/30'>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit(e);
          }}
          className='max-w-3xl mx-auto'
        >
          <ChatInput
            value={input}
            onChange={handleInputChange}
            onSubmit={handleSubmit}
            isLoading={isLoading}
            placeholder='输入你的问题... (支持 Markdown 格式)'
            maxLength={2000}
          />
        </form>
      </div>
    </div>
  );
}
