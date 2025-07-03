/**
 * 3. useAssistant - OpenAI Assistants
 */
import { useAssistant } from '@ai-sdk/react';

const AssistantComponent = () => {
  const {
    status, // 'awaiting_message' | 'in_progress' | 'completed'
    messages, // 对话消息
    input,
    submitMessage, // 发送消息
    handleInputChange,
    error,
  } = useAssistant({
    api: 'http://localhost:8080/api/assistant',
  });

  return (
    <div className='space-y-4'>
      <h2 className='text-xl font-bold'>AI 助手对话</h2>

      {/* 状态显示 */}
      <div className='text-sm text-gray-600'>
        状态: {status === 'in_progress' ? '思考中...' : '等待输入'}
      </div>

      {/* 消息列表 */}
      <div className='space-y-2 max-h-96 overflow-y-auto'>
        {messages.map((message) => (
          <div
            key={message.id}
            className={`p-3 rounded ${
              message.role === 'user' ? 'bg-blue-100 ml-8' : 'bg-gray-100 mr-8'
            }`}
          >
            <div className='font-bold text-sm mb-1'>
              {message.role === 'user' ? '用户' : 'AI助手'}
            </div>
            <div>{message.content}</div>
          </div>
        ))}
      </div>

      {/* 输入区域 */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submitMessage();
        }}
        className='flex gap-2'
      >
        <input
          value={input}
          onChange={handleInputChange}
          placeholder='输入消息...'
          className='flex-1 p-2 border rounded'
          disabled={status === 'in_progress'}
        />
        <button
          type='submit'
          disabled={status === 'in_progress' || !input.trim()}
          className='px-4 py-2 bg-purple-500 text-white rounded disabled:opacity-50'
        >
          发送
        </button>
      </form>

      {error && (
        <div className='p-4 bg-red-100 text-red-700 rounded'>
          错误: {error.message}
        </div>
      )}
    </div>
  );
};

export default AssistantComponent;
