import { useState } from 'react';
import axios from 'axios';
import './index.less';

function Chat() {
  // 状态管理
  const [input, setInput] = useState(''); // 输入框内容
  const [messages, setMessages] = useState([]); // 对话消息列表
  const [isLoading, setIsLoading] = useState(false); // 是否正在等待AI响应

  // 处理消息发送
  const handleSubmit = async (e: FormDataEvent) => {
    e.preventDefault(); // 阻止表单默认提交行为
    if (!input.trim() || isLoading) return; // 输入为空或正在加载时，直接返回

    const userMessage = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]); // 立即显示用户发送的消息
    setIsLoading(true);
    setInput('');

    try {
      // 调用 API
      const response = await axios.post('http://localhost:3001/api/chat', {
        message: input,
      });

      const aiMessage = { role: 'assistant', content: response.data.reply };
      setMessages((prev) => [...prev, aiMessage]); // AI 回复
    } catch (error) {
      console.error('Error fetching AI reply:', error);
      const errorMessage = { role: 'assistant', content: '抱歉，我暂时无法回答。' };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='app-container bg-red-500'>
      <div className='text-red-400'>测试tailwindcss</div>
      <div className='chat-window'>
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.role}`}>
            <p>{msg.content}</p>
          </div>
        ))}
        {isLoading && (
          <div className='message assistant'>
            <p>
              <i>正在思考中...</i>
            </p>
          </div>
        )}
      </div>
      <form className='input-form' onSubmit={handleSubmit}>
        <input
          type='text'
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder='请输入你的问题...'
          disabled={isLoading}
        />
        <button type='submit' disabled={isLoading}>
          发送
        </button>
      </form>
    </div>
  );
}

export default Chat;
