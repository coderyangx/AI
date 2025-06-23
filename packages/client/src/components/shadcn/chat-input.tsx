import React from 'react';
import { SendHorizontal } from 'lucide-react';
// import { Input } from '@/components/ui/input';
// import { Button } from '@/components/ui/button';
import { Input } from './input';
import { Button } from './button';

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
    <form onSubmit={handleSubmit} className={className}>
      <div className='flex space-x-2'>
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder='请输入你的问题...'
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
  );
}
