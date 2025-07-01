import React, { useEffect, useRef, useState } from 'react';
import { SendHorizontal, Bot, User } from 'lucide-react';
import { MessageBubble } from './MessageBubble';
import { Input } from '@/components/shadcn/Input';
import { Button } from '@/components/shadcn/Button';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/shadcn/Avatar';
import { ScrollArea } from '@/components/ui/ScrollArea';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant' | 'system' | 'tool';
  timestamp: string;
}

export default function ChatContainer() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // 自动滚动到底部
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input.trim(),
      role: 'user',
      timestamp: new Date().toLocaleTimeString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:8000/api/agent/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: userMessage.content }),
      });

      if (!response.ok) {
        throw new Error('网络请求失败');
      }

      const data = await response.json();
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.reply,
        role: 'assistant',
        timestamp: new Date().toLocaleTimeString(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: '抱歉，发生了一些错误。请稍后再试。',
        role: 'system',
        timestamp: new Date().toLocaleTimeString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const getAvatar = (role: Message['role']) => {
    switch (role) {
      case 'assistant':
        return (
          <Avatar>
            <AvatarImage src='/bot-avatar.png' alt='AI Assistant' />
            <AvatarFallback>
              <Bot className='w-6 h-6 text-blue-500' />
            </AvatarFallback>
          </Avatar>
        );
      case 'user':
        return (
          <Avatar>
            <AvatarImage src='/user-avatar.png' alt='User' />
            <AvatarFallback>
              <User className='w-6 h-6 text-gray-500' />
            </AvatarFallback>
          </Avatar>
        );
      default:
        return null;
    }
  };

  return (
    <div className='flex flex-col h-[calc(100vh-2rem)] max-w-4xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden'>
      <div className='flex items-center justify-between px-6 py-4 border-b'>
        <div className='flex items-center space-x-2'>
          <Bot className='w-6 h-6 text-blue-500' />
          <h2 className='text-lg font-semibold'>AI 助手</h2>
        </div>
      </div>

      <ScrollArea className='flex-1 p-4' ref={scrollAreaRef}>
        <div className='space-y-4'>
          {messages.map((message) => (
            <MessageBubble
              key={message.id}
              content={message.content}
              role={message.role}
              timestamp={message.timestamp}
              avatar={getAvatar(message.role)}
            />
          ))}
          {isLoading && (
            <MessageBubble
              content=''
              role='assistant'
              isLoading={true}
              avatar={getAvatar('assistant')}
            />
          )}
        </div>
      </ScrollArea>

      <form onSubmit={handleSubmit} className='p-4 border-t'>
        <div className='flex space-x-2'>
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder='输入你的问题...'
            disabled={isLoading}
            // wrapperClassName='flex-1'
            // className='flex-1'
          />
          <Button type='submit' disabled={isLoading || !input.trim()}>
            <SendHorizontal className='w-5 h-5' />
            <span className='ml-2'>发送</span>
          </Button>
        </div>
      </form>
    </div>
  );
}
