// new gemini-ui
import { useState } from 'react';
import { Bot, User, Copy, ThumbsUp, ThumbsDown } from 'lucide-react';
import { Button, Avatar, AvatarFallback, AvatarImage } from '@/components/ui';
import { motion } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { cn } from '@/utils/cn';

interface MessageBubbleProps {
  content: string;
  role: 'user' | 'assistant' | 'system' | 'tool';
  timestamp?: string;
  isLoading?: boolean;
  className?: string;
  // 新增的可选功能
  id?: string;
  onCopy?: (content: string) => void;
  onLike?: (id: string) => void;
  onDislike?: (id: string) => void;
}

const LoadingDots = () => {
  return (
    <div className='flex items-center space-x-1'>
      <motion.span
        className='w-1.5 h-1.5 bg-muted-foreground rounded-full'
        animate={{ scale: [0.8, 1.2, 0.8] }}
        transition={{ duration: 0.9, repeat: Infinity, repeatDelay: 0 }}
      />
      <motion.span
        className='w-1.5 h-1.5 bg-muted-foreground rounded-full'
        animate={{ scale: [0.8, 1.2, 0.8] }}
        transition={{
          duration: 0.9,
          delay: 0.3,
          repeat: Infinity,
          repeatDelay: 0,
        }}
      />
      <motion.span
        className='w-1.5 h-1.5 bg-muted-foreground rounded-full'
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

// 自定义代码块样式
const CodeBlock = ({ node, inline, className, children, ...props }: any) => {
  const match = /language-(\w+)/.exec(className || '');
  const language = match && match[1] ? match[1] : '';

  if (inline) {
    return (
      <code
        className='bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-sm font-mono'
        {...props}
      >
        {children}
      </code>
    );
  }

  return (
    <div className='relative my-4 rounded-md overflow-hidden'>
      {language && (
        <div className='absolute top-0 right-0 bg-gray-200 dark:bg-gray-700 px-2 py-0.5 text-xs rounded-bl-md'>
          {language}
        </div>
      )}
      <pre className='bg-gray-100 dark:bg-gray-800 p-4 rounded-md overflow-x-auto'>
        <code
          className={
            className ? `text-sm font-mono ${className}` : 'text-sm font-mono'
          }
          {...props}
        >
          {children}
        </code>
      </pre>
    </div>
  );
};

export function MessageBubble(props: MessageBubbleProps) {
  const {
    content,
    role,
    timestamp,
    isLoading = false,
    className,
    id,
    onCopy,
    onLike,
    onDislike,
  } = props;

  const isUser = role === 'user';
  const [showActions, setShowActions] = useState(false);

  const containerVariants = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, transition: { duration: 0.2 } },
  };

  const getAvatar = () => {
    if (isUser) {
      return (
        <Avatar>
          <AvatarImage src='/user-avatar.png' alt='User' />
          <AvatarFallback>
            <User className='h-5 w-5' />
          </AvatarFallback>
        </Avatar>
      );
    }
    return (
      <Avatar>
        <AvatarImage src='/bot-avatar.png' alt='AI Assistant' />
        <AvatarFallback>
          <Bot className='h-5 w-5' />
        </AvatarFallback>
      </Avatar>
    );
  };

  const getBubbleStyles = () => {
    switch (role) {
      case 'user':
        return 'bg-primary text-primary-foreground';
      case 'assistant':
        return 'bg-muted text-foreground';
      case 'system':
        return 'bg-secondary text-secondary-foreground italic';
      case 'tool':
        return 'bg-accent text-accent-foreground font-mono text-sm';
      default:
        return 'bg-background text-foreground';
    }
  };

  const handleCopy = async () => {
    onCopy?.(content);
  };

  // 自定义组件映射
  const components = {
    code: CodeBlock,
    // 自定义链接在新窗口打开
    a: ({ node, href, children, ...props }: any) => (
      <a
        href={href}
        target='_blank'
        rel='noopener noreferrer'
        className='text-blue-500 hover:underline'
        {...props}
      >
        {children}
      </a>
    ),
    // 自定义表格样式
    table: ({ node, children, ...props }: any) => (
      <div className='overflow-x-auto my-4'>
        <table
          className='min-w-full divide-y divide-gray-200 dark:divide-gray-700'
          {...props}
        >
          {children}
        </table>
      </div>
    ),
    thead: ({ node, children, ...props }: any) => (
      <thead className='bg-gray-100 dark:bg-gray-800' {...props}>
        {children}
      </thead>
    ),
    th: ({ node, children, ...props }: any) => (
      <th
        className='px-4 py-2 text-left text-xs font-medium uppercase tracking-wider'
        {...props}
      >
        {children}
      </th>
    ),
    td: ({ node, children, ...props }: any) => (
      <td className='px-4 py-2 whitespace-nowrap text-sm' {...props}>
        {children}
      </td>
    ),
    // 自定义列表样式
    ul: ({ node, children, ...props }: any) => (
      <ul className='list-disc pl-5 my-2 space-y-1 text-left' {...props}>
        {children}
      </ul>
    ),
    ol: ({ node, children, ...props }: any) => (
      <ol className='list-decimal pl-5 my-2 space-y-1 text-left' {...props}>
        {children}
      </ol>
    ),
    // 自定义标题样式
    h1: ({ node, children, ...props }: any) => (
      <h1 className='text-2xl font-bold my-4 text-left' {...props}>
        {children}
      </h1>
    ),
    h2: ({ node, children, ...props }: any) => (
      <h2 className='text-xl font-bold my-3 text-left' {...props}>
        {children}
      </h2>
    ),
    h3: ({ node, children, ...props }: any) => (
      <h3 className='text-lg font-bold my-2 text-left' {...props}>
        {children}
      </h3>
    ),
    // 自定义段落样式
    p: ({ node, children, ...props }: any) => (
      <p className='my-2 text-left' {...props}>
        {children}
      </p>
    ),
  };

  const containerClasses = `flex w-full items-start gap-3 py-4 ${
    isUser ? 'flex-row-reverse' : 'flex-row'
  } ${className || ''}`;

  // max-w-[80%]
  const bubbleClasses = `relative rounded-lg px-4 py-2 shadow-sm ${getBubbleStyles()} ${
    isUser ? 'rounded-tr-none' : 'rounded-tl-none'
  }`;

  return (
    <motion.div
      className={containerClasses}
      variants={containerVariants}
      initial='initial'
      animate='animate'
      exit='exit'
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {getAvatar()}

      <div className='flex flex-col gap-1'>
        <div className={bubbleClasses}>
          {isLoading ? (
            <LoadingDots />
          ) : (
            <>
              {isUser ? (
                <div className='whitespace-pre-wrap break-words text-left'>
                  {content}
                </div>
              ) : (
                <div className='markdown-content w-full text-left'>
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeRaw]}
                    components={components}
                  >
                    {content}
                  </ReactMarkdown>
                </div>
              )}
              <div className='text-xs  mt-1 text-right text-gray-500'>
                {timestamp || '刚刚'}
              </div>
              {/* {timestamp && (
                <div className='text-xs text-muted-foreground mt-1 text-right'>
                  {timestamp}
                </div>
              )} */}
            </>
          )}
        </div>

        {/* 新增：操作按钮区域 */}
        {!isLoading && (onCopy || onLike || onDislike) && (
          <div
            className={cn(
              'flex items-center gap-1 px-2 transition-opacity duration-200',
              showActions ? 'opacity-100' : 'opacity-0',
              isUser ? 'flex-row-reverse' : 'flex-row'
            )}
          >
            {!isUser && (
              <>
                {onCopy && (
                  <Button
                    variant='ghost'
                    size='sm'
                    className='h-6 w-6 p-0 hover:bg-gray-200 dark:hover:bg-gray-700'
                    onClick={handleCopy}
                    title='复制内容'
                  >
                    <Copy className='h-3 w-3' />
                  </Button>
                )}
                {onLike && id && (
                  <Button
                    variant='ghost'
                    size='sm'
                    className='h-6 w-6 p-0 hover:bg-gray-200 dark:hover:bg-gray-700'
                    onClick={() => onLike(id)}
                    title='点赞'
                  >
                    <ThumbsUp className='h-3 w-3' />
                  </Button>
                )}
                {onDislike && id && (
                  <Button
                    variant='ghost'
                    size='sm'
                    className='h-6 w-6 p-0 hover:bg-gray-200 dark:hover:bg-gray-700'
                    onClick={() => onDislike(id)}
                    title='踩'
                  >
                    <ThumbsDown className='h-3 w-3' />
                  </Button>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}

// old ui
// import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
// import { Bot, User } from 'lucide-react';
// import { AnimatePresence, motion } from 'motion/react';
// import ReactMarkdown from 'react-markdown';
// import remarkGfm from 'remark-gfm';
// import rehypeRaw from 'rehype-raw';

// interface MessageBubbleProps {
//   content: string;
//   role: 'user' | 'assistant' | 'system' | 'tool';
//   timestamp?: string;
//   isLoading?: boolean;
//   className?: string;
// }

// const LoadingDots = () => {
//   return (
//     <div className='flex items-center space-x-1'>
//       <motion.span
//         className='w-1.5 h-1.5 bg-muted-foreground rounded-full'
//         animate={{ scale: [0.8, 1.2, 0.8] }}
//         transition={{ duration: 0.9, repeat: Infinity, repeatDelay: 0 }}
//       />
//       <motion.span
//         className='w-1.5 h-1.5 bg-muted-foreground rounded-full'
//         animate={{ scale: [0.8, 1.2, 0.8] }}
//         transition={{ duration: 0.9, delay: 0.3, repeat: Infinity, repeatDelay: 0 }}
//       />
//       <motion.span
//         className='w-1.5 h-1.5 bg-muted-foreground rounded-full'
//         animate={{ scale: [0.8, 1.2, 0.8] }}
//         transition={{ duration: 0.9, delay: 0.6, repeat: Infinity, repeatDelay: 0 }}
//       />
//     </div>
//   );
// };

// // 自定义代码块样式
// const CodeBlock = ({ node, inline, className, children, ...props }: any) => {
//   const match = /language-(\w+)/.exec(className || '');
//   const language = match && match[1] ? match[1] : '';

//   if (inline) {
//     return (
//       <code
//         className='bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-sm font-mono'
//         {...props}
//       >
//         {children}
//       </code>
//     );
//   }

//   return (
//     <div className='relative my-4 rounded-md overflow-hidden'>
//       {language && (
//         <div className='absolute top-0 right-0 bg-gray-200 dark:bg-gray-700 px-2 py-0.5 text-xs rounded-bl-md'>
//           {language}
//         </div>
//       )}
//       <pre className='bg-gray-100 dark:bg-gray-800 p-4 rounded-md overflow-x-auto'>
//         <code
//           className={className ? `text-sm font-mono ${className}` : 'text-sm font-mono'}
//           {...props}
//         >
//           {children}
//         </code>
//       </pre>
//     </div>
//   );
// };

// export function MessageBubble({
//   content,
//   role,
//   timestamp,
//   isLoading = false,
//   className,
// }: MessageBubbleProps) {
//   const isUser = role === 'user';

//   const containerVariants = {
//     initial: { opacity: 0, y: 10 },
//     animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
//     exit: { opacity: 0, transition: { duration: 0.2 } },
//   };

//   const getAvatar = () => {
//     if (isUser) {
//       return (
//         <Avatar>
//           <AvatarImage src='/user-avatar.png' alt='User' />
//           <AvatarFallback>
//             <User className='h-5 w-5' />
//           </AvatarFallback>
//         </Avatar>
//       );
//     }
//     return (
//       <Avatar>
//         <AvatarImage src='/bot-avatar.png' alt='AI Assistant' />
//         <AvatarFallback>
//           <Bot className='h-5 w-5' />
//         </AvatarFallback>
//       </Avatar>
//     );
//   };

//   const getBubbleStyles = () => {
//     switch (role) {
//       case 'user':
//         return 'bg-primary text-primary-foreground';
//       case 'assistant':
//         return 'bg-muted text-foreground';
//       case 'system':
//         return 'bg-secondary text-secondary-foreground italic';
//       case 'tool':
//         return 'bg-accent text-accent-foreground font-mono text-sm';
//       default:
//         return 'bg-background text-foreground';
//     }
//   };

//   // 自定义组件映射
//   const components = {
//     code: CodeBlock,
//     // 自定义链接在新窗口打开
//     a: ({ node, href, children, ...props }: any) => (
//       <a
//         href={href}
//         target='_blank'
//         rel='noopener noreferrer'
//         className='text-blue-500 hover:underline'
//         {...props}
//       >
//         {children}
//       </a>
//     ),
//     // 自定义表格样式
//     table: ({ node, children, ...props }: any) => (
//       <div className='overflow-x-auto my-4'>
//         <table className='min-w-full divide-y divide-gray-200 dark:divide-gray-700' {...props}>
//           {children}
//         </table>
//       </div>
//     ),
//     thead: ({ node, children, ...props }: any) => (
//       <thead className='bg-gray-100 dark:bg-gray-800' {...props}>
//         {children}
//       </thead>
//     ),
//     th: ({ node, children, ...props }: any) => (
//       <th className='px-4 py-2 text-left text-xs font-medium uppercase tracking-wider' {...props}>
//         {children}
//       </th>
//     ),
//     td: ({ node, children, ...props }: any) => (
//       <td className='px-4 py-2 whitespace-nowrap text-sm' {...props}>
//         {children}
//       </td>
//     ),
//     // 自定义列表样式
//     ul: ({ node, children, ...props }: any) => (
//       <ul className='list-disc pl-5 my-2 space-y-1 text-left' {...props}>
//         {children}
//       </ul>
//     ),
//     ol: ({ node, children, ...props }: any) => (
//       <ol className='list-decimal pl-5 my-2 space-y-1 text-left' {...props}>
//         {children}
//       </ol>
//     ),
//     // 自定义标题样式
//     h1: ({ node, children, ...props }: any) => (
//       <h1 className='text-2xl font-bold my-4 text-left' {...props}>
//         {children}
//       </h1>
//     ),
//     h2: ({ node, children, ...props }: any) => (
//       <h2 className='text-xl font-bold my-3 text-left' {...props}>
//         {children}
//       </h2>
//     ),
//     h3: ({ node, children, ...props }: any) => (
//       <h3 className='text-lg font-bold my-2 text-left' {...props}>
//         {children}
//       </h3>
//     ),
//     // 自定义段落样式
//     p: ({ node, children, ...props }: any) => (
//       <p className='my-2 text-left' {...props}>
//         {children}
//       </p>
//     ),
//   };

//   const containerClasses = `flex w-full items-start gap-3 py-4 ${
//     isUser ? 'flex-row-reverse' : 'flex-row'
//   } ${className || ''}`;
//   const bubbleClasses = `relative rounded-lg px-4 py-2 max-w-[80%] shadow-sm ${getBubbleStyles()} ${
//     isUser ? 'rounded-tr-none' : 'rounded-tl-none'
//   }`;

//   return (
//     <motion.div
//       className={containerClasses}
//       variants={containerVariants}
//       initial='initial'
//       animate='animate'
//       exit='exit'
//     >
//       {getAvatar()}

//       <div className={bubbleClasses}>
//         {isLoading ? (
//           <LoadingDots />
//         ) : (
//           <>
//             {isUser ? (
//               <div className='whitespace-pre-wrap break-words text-left'>{content}</div>
//             ) : (
//               <div className='markdown-content w-full text-left'>
//                 <ReactMarkdown
//                   remarkPlugins={[remarkGfm]}
//                   rehypePlugins={[rehypeRaw]}
//                   components={components}
//                 >
//                   {content}
//                 </ReactMarkdown>
//               </div>
//             )}
//             {timestamp && (
//               <div className='text-xs text-muted-foreground mt-1 text-right'>{timestamp}</div>
//             )}
//           </>
//         )}
//       </div>
//     </motion.div>
//   );
// }
