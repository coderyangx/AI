/**
 * 4. useActions - 服务器操作
 */
import { useActions, useUIState } from 'ai/rsc';

const ActionsComponent = () => {
  const { submitUserMessage } = useActions();
  const [messages, setMessages] = useUIState();

  const handleSubmit = async (input: string) => {
    // 添加用户消息到 UI 状态
    setMessages((currentMessages) => [
      ...currentMessages,
      { id: Date.now(), role: 'user', content: input },
    ]);

    // 调用服务器操作
    const response = await submitUserMessage(input);

    // 添加 AI 响应到 UI 状态
    setMessages((currentMessages) => [...currentMessages, response]);
  };

  return (
    <div className='space-y-4'>
      <h2 className='text-xl font-bold'>服务器操作</h2>

      <div className='space-y-2'>
        {messages.map((message: any) => (
          <div key={message.id} className='p-2 rounded bg-gray-100'>
            <strong>{message.role}:</strong> {message.content}
          </div>
        ))}
      </div>

      <button
        onClick={() => handleSubmit('Hello from client!')}
        className='px-4 py-2 bg-indigo-500 text-white rounded'
      >
        发送消息
      </button>
    </div>
  );
};

export default ActionsComponent;
