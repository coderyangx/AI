# 📚 Hooks 对比表

| Hook          | 用途       | 输入方式   | 输出格式   | 适用场景           |
| ------------- | ---------- | ---------- | ---------- | ------------------ |
| useChat       | 多轮对话   | 消息列表   | 消息流     | 聊天机器人、客服   |
| useCompletion | 单次生成   | 单个提示词 | 文本字符串 | 文案生成、续写     |
| useObject     | 结构化生成 | 提示词     | 结构化对象 | 表单填充、数据提取 |
| useAssistant  | AI 助手    | 消息       | 助手响应   | 专业助手、工具调用 |
| useActions    | 服务器操作 | 用户输入   | UI 组件    | 复杂交互、状态管理 |

这些 hooks 可以根据不同的应用场景灵活选择和组合使用！

# 📚 使用示例

## 1. useChat - 多轮对话

```tsx
import { useChat } from '@ai-sdk/react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const { messages, input, handleInputChange, handleSubmit } = useChat({
  api: 'http://localhost:8080/api/chat',
});

return (
  <div>
    <div className='flex flex-col flex-1 gap-2 min-h-[300px] bg-blue-50 p-4 rounded-md overflow-y-auto'>
      {messages.map((message) => (
        <div key={message.id}>{message.content}</div>
      ))}
    </div>
    <div className='flex gap-2'>
      <Input
        placeholder='Type a message...'
        value={input}
        onChange={handleInputChange}
      />
      <Button onClick={handleSubmit} className='bg-blue-500 text-white'>
        Send
      </Button>
    </div>
  </div>
);
```

## 2. useCompletion - 单次生成

```tsx
import { useCompletion } from '@ai-sdk/react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const { completion, input, handleInputChange, handleSubmit } = useCompletion({
  api: 'http://localhost:8080/api/completion',
});

return (
  <div>
    <div className='flex flex-col flex-1 gap-2 min-h-[300px] bg-blue-50 p-4 rounded-md overflow-y-auto'>
      {completion}
    </div>
    <div className='flex gap-2'>
      <Input
        placeholder='Type a message...'
        value={input}
        onChange={handleInputChange}
      />
      <Button onClick={handleSubmit} className='bg-blue-500 text-white'>
        Send
      </Button>
    </div>
  </div>
);
```

## 3. useObject - 结构化生成

```tsx
import { useObject } from '@ai-sdk/react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const { object, input, handleInputChange, handleSubmit } = useObject({
  api: 'http://localhost:8080/api/object',
});

return (
  <div>
    <div className='flex flex-col flex-1 gap-2 min-h-[300px] bg-blue-50 p-4 rounded-md overflow-y-auto'>
      {object}
    </div>
    <div className='flex gap-2'>
      <Input
        placeholder='Type a message...'
        value={input}
        onChange={handleInputChange}
      />
      <Button onClick={handleSubmit} className='bg-blue-500 text-white'>
        Send
      </Button>
    </div>
  </div>
);
```

## 4. useAssistant - AI 助手

```tsx

```

## 5. useActions - 服务器操作

```tsx

```

## 6. useAllHooks - 组合使用多个 hooks

```tsx

```
