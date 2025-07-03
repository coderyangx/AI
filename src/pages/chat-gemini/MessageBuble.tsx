import React from 'react';
import type { Message } from '@ai-sdk/react';
import { cn } from '@/utils/cn';
import { Bot, User, Copy, ThumbsUp, ThumbsDown } from 'lucide-react';
import { Button, Avatar, AvatarFallback } from '@/components/ui';

// 消息气泡组件
export default function MessageBubble({
  message,
  onCopy,
}: {
  message: Message;
  onCopy: (content: string) => void;
}) {
  const isUser = message.role === 'user';
  const [showActions, setShowActions] = React.useState(false);

  return (
    <div
      className={cn(
        'flex gap-3 group',
        isUser ? 'flex-row-reverse' : 'flex-row'
      )}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* 头像 */}
      <Avatar className='h-8 w-8 shrink-0'>
        <AvatarFallback
          className={cn(
            isUser ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'
          )}
        >
          {isUser ? <User className='h-4 w-4' /> : <Bot className='h-4 w-4' />}
        </AvatarFallback>
      </Avatar>

      {/* 消息内容 */}
      <div
        className={cn(
          'flex flex-col gap-1 max-w-[70%]',
          isUser ? 'items-end' : 'items-start'
        )}
      >
        {/* 消息气泡 */}
        <div
          className={cn(
            'px-4 py-3 rounded-2xl text-sm leading-relaxed',
            'transition-all duration-200',
            isUser
              ? 'bg-blue-500 text-white rounded-br-md'
              : 'bg-gray-100 text-gray-900 rounded-bl-md hover:bg-gray-150'
          )}
        >
          <div className='whitespace-pre-wrap break-words'>
            {message.content}
          </div>
        </div>

        {/* 时间戳和操作按钮 */}
        <div
          className={cn(
            'flex items-center gap-2 px-2 transition-opacity',
            showActions ? 'opacity-100' : 'opacity-0',
            isUser ? 'flex-row-reverse' : 'flex-row'
          )}
        >
          <span className='text-xs text-gray-500'>
            {message.createdAt?.toLocaleTimeString() || '刚刚'}
          </span>

          {!isUser && (
            <div className='flex items-center gap-1'>
              <Button
                variant='ghost'
                size='sm'
                className='h-6 w-6 p-0 hover:bg-gray-200'
                onClick={() => onCopy(message.content)}
              >
                <Copy className='h-3 w-3' />
              </Button>
              <Button
                variant='ghost'
                size='sm'
                className='h-6 w-6 p-0 hover:bg-gray-200'
              >
                <ThumbsUp className='h-3 w-3' />
              </Button>
              <Button
                variant='ghost'
                size='sm'
                className='h-6 w-6 p-0 hover:bg-gray-200'
              >
                <ThumbsDown className='h-3 w-3' />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
