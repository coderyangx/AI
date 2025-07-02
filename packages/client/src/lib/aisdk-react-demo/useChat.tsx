/**
 * 使用 Vercel AI SDK 的 useChat 以及工具调用 - 简单场景
 * 最佳实践组合：Vercel AI SDK 处理前端交互，LangChain 处理复杂 RAG 和 Agent 逻辑
 */
import { useChat } from '@ai-sdk/react';
import { Input, Button } from '@/components/shadcn';

const ChatComponent = () => {
  const {
    messages,
    input = '',
    handleInputChange,
    handleSubmit,
  } = useChat({
    api: 'http://localhost:8080/api/agent/stream', // hono 服务器
    // api: 'http://localhost:8000/api/agent/stream', // express 服务器
    streamProtocol: 'data',
    // onResponse: (response) => {
    //   console.log('onResponse: ', response);
    // },
    // body: {
    //   message: 'hello',
    // },
  });

  console.log('messages', messages);

  return (
    <div className='flex flex-col gap-2'>
      <div className='text-2xl font-bold'>ChatComponent By AI SDK</div>
      <div className='flex flex-col flex-1 gap-2 min-h-[300px] bg-amber-50 p-4 rounded-md overflow-y-auto'>
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex flex-col gap-2 ${
              message.role === 'user' ? 'items-end' : 'items-start'
            }`}
          >
            <div className='text-sm text-gray-500'>{message.role}</div>
            <div className='text-base bg-white p-2 rounded-md'>
              {message.content}
            </div>
            {/* <div className='text-base bg-white p-2 rounded-md'>
              {message.content.split('\n').map((line, index) => (
                <span key={index}>
                  {line}
                  {index < message.content.split('\n').length - 1 && <br />}
                </span>
              ))}
            </div> */}
            <div className='text-sm text-gray-500'>
              {message.createdAt?.toLocaleString()}
            </div>
          </div>
        ))}
      </div>
      <div className='flex gap-2'>
        <Input
          placeholder='Type a message...'
          value={input}
          onChange={handleInputChange}
          wrapperClassName='flex-1'
        />
        <Button onClick={handleSubmit} className='bg-blue-500 text-white'>
          Send
        </Button>
      </div>
      <div>
        <input
          placeholder='Type a message...'
          value={input}
          onChange={handleInputChange}
        />
      </div>
      <div className=''>
        <div className='text-2xl font-bold'>AgentComponent 测试</div>
        <AgentComponent />
      </div>
    </div>
  );
};

// function calling
const tools = [
  {
    type: 'function',
    function: {
      name: 'getWeather',
      description: '获取天气信息',
      parameters: {
        type: 'object',
        properties: {
          location: { type: 'string' },
        },
        required: ['location'],
      },
    },
  },
];

const AgentComponent = () => {
  const { messages, input, handleInputChange, handleSubmit } = useChat({
    api: 'http://localhost:8080/api/agent/test',
    body: { tools },
  });

  return (
    // UI 代码
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
          wrapperClassName='flex-1'
        />
        <Button onClick={handleSubmit} className='bg-blue-500 text-white'>
          Send
        </Button>
      </div>
    </div>
  );
};

export default ChatComponent;
