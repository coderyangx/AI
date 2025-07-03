import { Loader2, SendHorizontal } from 'lucide-react'
import React from 'react'
// import { Input } from '@/components/ui/input';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/shadcn/Input';
import { Button, Textarea } from '@/components/ui'

interface ChatInputProps {
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
  isLoading?: boolean
  className?: string
}

export function ChatInput({ value, onChange, onSubmit, isLoading = false, className }: ChatInputProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // 自动聚焦
    console.log('input: ', document.querySelector('input'))
    if (!value.trim() || isLoading) return
    onSubmit()
    setTimeout(() => {
      document.querySelector('input')?.focus()
    }, 100)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (!value.trim() || isLoading) return
      onSubmit()
      setTimeout(() => {
        ;(e.target as HTMLTextAreaElement).focus()
      }, 100)
    }
  }

  return (
    <div className='flex justify-between flex-col w-full h-30 max-h-[200px] overflow-y-auto border  rounded-2xl  px-2 py-2 focus-within:border-foreground  hover:shadow-lg transition-all duration-300'>
      <form onSubmit={handleSubmit} className='flex flex-1 grow h-full'>
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
          onKeyDown={handleKeyDown}
          placeholder='请输入你的问题...' // (支持 Markdown 格式)
          disabled={isLoading}
          className='flex-1 file:text-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 flex w-full bg-transparent px-3 py text-base text-foreground dark:text-foreground shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm  aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40  resize-none  placeholder:text-gray-400 border-none focus:border-none focus:ring-0 focus:outline-none'
          style={{
            boxShadow: 'none',
            background: 'transparent',
            border: 'none'
          }}
        />
      </form>
      {/* 提示文本 */}
      <div className='flex justify-between items-center mt-2 px-1 text-xs text-gray-500'>
        <div className='flex flex-col-reverse h-full'>
          <span className='flex flex-col-reverse'>按 Enter 发送，Shift + Enter 换行</span>
          {isLoading && (
            <span className='flex items-center gap-1'>
              <Loader2 className='h-3 w-3 animate-spin' />
              正在思考...
            </span>
          )}
        </div>
        <Button type='submit' disabled={isLoading || !value.trim()} className='min-w-[80px] gap-2 rounded-xl h-10'>
          <SendHorizontal className='h-4 w-4' />
          <span>发送</span>
        </Button>
      </div>
    </div>
  )
}
