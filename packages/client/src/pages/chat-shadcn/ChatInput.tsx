import React from 'react';
import { Loader2, SendHorizontal } from 'lucide-react';
// import { Input } from '@/components/ui/input';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/shadcn/Input';
import { Button } from '@/components/shadcn/Button';
import { Textarea } from '@/components/shadcn/Textarea';

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  isLoading?: boolean;
  className?: string;
}

export function ChatInput({
  value,
  onChange,
  onSubmit,
  isLoading = false,
  className,
}: ChatInputProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // 自动聚焦
    console.log('input: ', document.querySelector('input'));
    if (!value.trim() || isLoading) return;
    onSubmit();
    setTimeout(() => {
      document.querySelector('input')?.focus();
    }, 100);
  };

  return (
    <>
      <form onSubmit={handleSubmit} className={className}>
        <div className='flex space-x-2'>
          {/* <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder='请输入你的问题...'
          disabled={isLoading}
          className='flex-1'
        /> */}
          <Textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder='请输入你的问题... (支持 Markdown 格式)'
            disabled={isLoading}
            className='flex-1'
          />
          <Button
            type='submit'
            disabled={isLoading || !value.trim()}
            // size='default'
            className='min-w-[80px] gap-2'
          >
            <SendHorizontal className='h-4 w-4' />
            <span>发送</span>
          </Button>
        </div>
      </form>
      {/* 提示文本 */}
      <div className='flex justify-between items-center mt-2 px-1 text-xs text-gray-500'>
        <span>按 Enter 发送，Shift + Enter 换行</span>
        {isLoading && (
          <span className='flex items-center gap-1'>
            <Loader2 className='h-3 w-3 animate-spin' />
            AI 正在思考...
          </span>
        )}
      </div>
    </>
  );
}
