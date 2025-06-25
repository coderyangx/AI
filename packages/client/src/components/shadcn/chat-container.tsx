import { useEffect, useRef, useState, useCallback } from 'react';
import { Bot, Sun, Moon, SunMoon, Zap } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import SplitText from '@/components/SplitText';
import { MessageBubble } from './message-bubble';
import { ChatInput } from './chat-input';
import { Button } from './button';
import { Switch } from './switch';
import { Label } from './label';
import { useTheme } from '@/utils/theme';
import { getCookie } from '@/config';
import { ContentCard } from './content-card';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant' | 'system' | 'tool';
  timestamp: string;
}

const cookie = getCookie();

export default function ChatContainer() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const { theme, toggleTheme } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [isStreamMode, setIsStreamMode] = useState(false);
  const [streamContent, setStreamContent] = useState('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const shouldScrollRef = useRef(true);

  // 滚动到底部的函数
  const scrollToBottom = useCallback(() => {
    if (!shouldScrollRef.current) return;

    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  // 监听消息变化和流内容变化，滚动到底部
  useEffect(() => {
    scrollToBottom();
  }, [messages, streamContent, scrollToBottom]);

  // 监听滚动事件，判断用户是否手动滚动
  useEffect(() => {
    const scrollArea = scrollAreaRef.current;
    const handleScroll = () => {
      if (!scrollArea) return;
      const { scrollTop, scrollHeight, clientHeight } = scrollArea;
      // 如果用户滚动到接近底部（20px误差范围内），则继续自动滚动
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 20;
      shouldScrollRef.current = isNearBottom;
    };
    if (scrollArea) {
      scrollArea.addEventListener('scroll', handleScroll);
    }
    return () => {
      if (scrollArea) {
        scrollArea.removeEventListener('scroll', handleScroll);
      }
    };
  }, []);

  const handleSubmit = async () => {
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
    setStreamContent('');
    // 强制滚动到底部
    shouldScrollRef.current = true;

    if (isStreamMode) {
      // 流式输出模式
      await handleStreamMode(userMessage.content);
    } else {
      // 普通模式
      await handleNormalMode(userMessage.content);
    }
  };

  // 处理普通输出
  const handleNormalMode = async (content: string) => {
    try {
      // 调用AI /api/agent/chat
      const response = await fetch('http://localhost:8000/api/agent/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Time': new Date().toLocaleString(),
          'X-Timestamp': new Date().getTime(),
          Cookie: cookie,
        },
        body: JSON.stringify({ message: content }),
      });

      if (!response.ok) {
        throw new Error('网络请求失败');
      }

      const data = await response.json();
      const aiResponse = data.message || data.reply || data.response || '';
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: aiResponse,
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

  // 处理流式输出
  const handleStreamMode = async (content: string) => {
    try {
      // 创建一个空的助手消息占位
      const placeholderId = (Date.now() + 1).toString();
      const timestamp = new Date().toLocaleTimeString();

      // 添加一个空的助手消息，用于显示流式内容
      setMessages((prev) => [
        ...prev,
        {
          id: placeholderId,
          content: '',
          role: 'assistant',
          timestamp,
        },
      ]);

      // 调用流式API
      // fetch 可以直接返回流式数据
      const response = await fetch('http://localhost:8000/api/agent/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Time': new Date().toLocaleString(),
          'X-Timestamp': new Date().getTime().toString(),
          Cookie: cookie,
        },
        body: JSON.stringify({ message: content }),
      });

      if (!response.ok) {
        throw new Error('网络请求失败');
      }

      // 基于 fetch 响应体的 getReader 方法，可以读取流式数据
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let accumulatedContent = '';

      if (!reader) {
        throw new Error('无法读取响应流');
      }

      while (true) {
        const { done, value } = await reader.read();
        console.log('流式数据:', value);
        if (done) break;
        // 解码
        const chunk = decoder.decode(value, { stream: true });
        // 处理SSE格式
        const lines = chunk.split('\n\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.substring(6);
            if (data === '[DONE]') {
              break;
            }
            try {
              const parsed = JSON.parse(data);
              if (parsed.content) {
                accumulatedContent += parsed.content;
                // 更新消息内容
                setStreamContent(accumulatedContent);
                // 更新现有消息
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === placeholderId
                      ? { ...msg, content: accumulatedContent }
                      : msg
                  )
                );
              }
            } catch (e) {
              console.error('解析SSE数据失败', e);
            }
          }
        }
      }
      // response.blob().then((blob) => {
      //   const reader = new FileReader();
      //   reader.onload = (e) => {
      //     const content = e.target?.result as string;
      //     console.log("流式数据:", content);
      //     // 将流式数据添加到 messages 中
      //     setMessages((prev) => [
      //       ...prev,
      //       {
      //         id: (Date.now() + 1).toString(),
      //         content: content,
      //         role: "assistant",
      //         timestamp: new Date().toLocaleTimeString(),
      //       },
      //     ]);
      //   };
      //   reader.readAsText(blob);
      // });
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: '抱歉，流式输出发生错误。请稍后再试。',
        role: 'system',
        timestamp: new Date().toLocaleTimeString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setStreamContent('');
    }
  };

  return (
    <div className='flex flex-col h-[calc(100vh-2rem)] max-w-4xl mx-auto bg-card rounded-lg shadow-lg overflow-hidden border'>
      <div className='flex items-center justify-between px-6 py-4 border-b bg-card'>
        <div className='flex items-center space-x-2'>
          <Bot className='h-5 w-5 text-primary' />
          <SplitText
            text='AI 助手'
            className='font-semibold text-center'
            delay={100}
            duration={0.6}
            ease='power3.out'
            splitType='chars'
            from={{ opacity: 0, y: 40 }}
            to={{ opacity: 1, y: 0 }}
            threshold={0.1}
            rootMargin='-100px'
            textAlign='center'
            onLetterAnimationComplete={() => {}}
          />
          {/* <h2 className='text-lg font-semibold flex'>AI 助手</h2> */}
          {/* <Button variant='destructive'>测试shadcn</Button>
          <Button variant='outline'>测试shadcn</Button>
          <Button variant='secondary'>测试shadcn</Button>
          <Button variant='ghost'>测试shadcn</Button>
          <Button variant='link'>测试shadcn</Button> */}
        </div>

        <div className='flex items-center space-x-4'>
          {/* 流式输出模式开关 */}
          <div className='flex items-center space-x-2'>
            <Switch
              id='stream-mode'
              checked={isStreamMode}
              onCheckedChange={setIsStreamMode}
            />
            <Label
              htmlFor='stream-mode'
              className='flex items-center space-x-1'
            >
              <Zap className='h-4 w-4' />
              <span>流式输出</span>
            </Label>
          </div>

          {/* 主题切换 variant='ghost' */}
          <Button
            variant='ghost'
            onClick={toggleTheme}
            className='rounded-full'
          >
            {theme === 'light' ? (
              <Sun className='h-5 w-5 cursor-pointer' />
            ) : (
              <Moon className='h-5 w-5 cursor-pointer' />
            )}
          </Button>
        </div>
      </div>

      <ScrollArea className='flex-1 px-4' ref={scrollAreaRef}>
        <ContentCard />
        <div className='space-y-4 py-4'>
          {messages.map((message) => (
            <MessageBubble
              key={message.id}
              content={message.content}
              role={message.role}
              timestamp={message.timestamp}
            />
          ))}
          {isLoading && !isStreamMode && (
            <MessageBubble content='' role='assistant' isLoading={true} />
          )}
          {/* 用于滚动到底部的空元素 */}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      <div className='p-4 border-t bg-card'>
        <ChatInput
          value={input}
          onChange={setInput}
          onSubmit={handleSubmit}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
