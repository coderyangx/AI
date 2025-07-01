import React from 'react';
import { cn } from '@/utils/cn';
import { AnimatePresence, motion } from 'framer-motion';

export interface MessageBubbleProps {
  content: string;
  role: 'user' | 'assistant' | 'system' | 'tool';
  timestamp?: string;
  isLoading?: boolean;
  avatar?: React.ReactNode;
  className?: string;
}

const LoadingDots = () => {
  return (
    <div className='flex items-center space-x-1'>
      <motion.span
        className='w-1.5 h-1.5 bg-gray-600 dark:bg-gray-300 rounded-full'
        animate={{ scale: [0.8, 1.2, 0.8] }}
        transition={{ duration: 0.9, repeat: Infinity, repeatDelay: 0 }}
      />
      <motion.span
        className='w-1.5 h-1.5 bg-gray-600 dark:bg-gray-300 rounded-full'
        animate={{ scale: [0.8, 1.2, 0.8] }}
        transition={{
          duration: 0.9,
          delay: 0.3,
          repeat: Infinity,
          repeatDelay: 0,
        }}
      />
      <motion.span
        className='w-1.5 h-1.5 bg-gray-600 dark:bg-gray-300 rounded-full'
        animate={{ scale: [0.8, 1.2, 0.8] }}
        transition={{
          duration: 0.9,
          delay: 0.6,
          repeat: Infinity,
          repeatDelay: 0,
        }}
      />
    </div>
  );
};

export function MessageBubble({
  content,
  role,
  timestamp,
  isLoading = false,
  avatar,
  className,
}: MessageBubbleProps) {
  const isUser = role === 'user';

  const containerVariants = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, transition: { duration: 0.2 } },
  };

  // 根据角色选择颜色样式
  const getBubbleStyles = () => {
    switch (role) {
      case 'user':
        return 'bg-blue-100 text-blue-900 border-blue-200';
      case 'assistant':
        return 'bg-white text-gray-800 border-gray-200';
      case 'system':
        return 'bg-gray-100 text-gray-800 border-gray-200 italic';
      case 'tool':
        return 'bg-green-50 text-green-800 border-green-100 font-mono text-sm';
      default:
        return 'bg-white text-gray-800 border-gray-200';
    }
  };

  return (
    <motion.div
      className={cn(
        'flex w-full items-start gap-2 py-2',
        isUser ? 'justify-end' : 'justify-start',
        className
      )}
      variants={containerVariants}
      initial='initial'
      animate='animate'
      exit='exit'
    >
      {!isUser && avatar && (
        <div className='flex-shrink-0 rounded-full overflow-hidden w-8 h-8'>
          {avatar}
        </div>
      )}

      <div
        className={cn(
          'relative rounded-lg border px-4 py-2 max-w-[80%] shadow-sm',
          getBubbleStyles(),
          isUser ? 'rounded-tr-none' : 'rounded-tl-none'
        )}
      >
        {isLoading ? (
          <LoadingDots />
        ) : (
          <>
            <div className='whitespace-pre-wrap break-words'>{content}</div>
            {timestamp && (
              <div className='text-xs text-gray-500 mt-1 text-right'>
                {timestamp}
              </div>
            )}
          </>
        )}
      </div>

      {isUser && avatar && (
        <div className='flex-shrink-0 rounded-full overflow-hidden w-8 h-8'>
          {avatar}
        </div>
      )}
    </motion.div>
  );
}
