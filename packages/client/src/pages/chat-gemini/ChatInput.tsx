import React, { useRef, useEffect, useState } from 'react';
import { cn } from '@/utils/cn';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/shadcn/Textarea';
import { Send, Square, Loader2 } from 'lucide-react';

interface ChatInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading?: boolean;
  disabled?: boolean;
  placeholder?: string;
  maxLength?: number;
  className?: string;
}

export default function ChatInput({
  value,
  onChange,
  onSubmit,
  isLoading = false,
  disabled = false,
  placeholder = '输入你的问题...',
  maxLength = 2000,
  className,
}: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  // 自动调整高度
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const scrollHeight = textarea.scrollHeight;
      const maxHeight = 200; // 最大高度限制
      textarea.style.height = `${Math.min(scrollHeight, maxHeight)}px`;
    }
  }, [value]);

  // 处理键盘事件
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (value.trim() && !isLoading) {
        onSubmit(e);
      }
    }
  };

  // 字符计数
  const charCount = value.length;
  const isNearLimit = charCount > maxLength * 0.8;

  return (
    <div className={cn('relative w-full', className)}>
      {/* 主输入容器 */}
      <div
        className={cn(
          'relative flex items-end gap-2 p-3 rounded-2xl border-2 transition-all duration-200',
          'bg-white shadow-sm hover:shadow-md',
          isFocused
            ? 'border-blue-500 shadow-md ring-4 ring-blue-500/10'
            : 'border-gray-200 hover:border-gray-300',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        {/* 文本输入区域 */}
        <div className='flex-1 relative'>
          <Textarea
            ref={textareaRef}
            value={value}
            onChange={onChange}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={placeholder}
            disabled={disabled || isLoading}
            maxLength={maxLength}
            className={cn(
              'min-h-[20px] max-h-[200px] resize-none border-0 p-0',
              'text-base leading-6 placeholder:text-gray-400',
              'focus-visible:ring-0 focus-visible:ring-offset-0',
              'scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent'
            )}
            style={{ height: 'auto' }}
          />

          {/* 字符计数 */}
          {charCount > 0 && (
            <div
              className={cn(
                'absolute -bottom-6 right-0 text-xs transition-colors',
                isNearLimit ? 'text-orange-500' : 'text-gray-400',
                charCount >= maxLength && 'text-red-500'
              )}
            >
              {charCount}/{maxLength}
            </div>
          )}
        </div>

        {/* 发送按钮 */}
        <div className='flex items-center gap-1'>
          {isLoading && (
            <Button
              type='button'
              size='sm'
              variant='outline'
              className='h-8 w-8 p-0 rounded-full'
              onClick={(e) => {
                e.preventDefault();
                // 这里可以添加停止生成的逻辑
              }}
            >
              <Square className='h-3 w-3' />
            </Button>
          )}

          <Button
            type='submit'
            size='sm'
            disabled={
              !value.trim() || isLoading || disabled || charCount > maxLength
            }
            className={cn(
              'h-8 w-8 p-0 rounded-full transition-all duration-200',
              'bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300',
              'shadow-sm hover:shadow-md active:scale-95'
            )}
            onClick={onSubmit}
          >
            {isLoading ? (
              <Loader2 className='h-3 w-3 animate-spin' />
            ) : (
              <Send className='h-3 w-3' />
            )}
          </Button>
        </div>
      </div>

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
    </div>
  );
}
