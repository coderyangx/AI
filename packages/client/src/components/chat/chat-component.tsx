import { useState } from 'react';
import { useChat } from '@ai-sdk/react';

const ChatComponent = () => {
  const { messages, input, handleInputChange, handleSubmit } = useChat({
    api: '/api/chat',
  });

  return (
    <div>
      <h1>ChatComponent By AI SDK</h1>
      <div>
        {messages.map((message) => (
          <div key={message.id}>{message.content}</div>
        ))}
      </div>
      <div>
        <input value={input} onChange={handleInputChange} />
        <button onClick={handleSubmit}>Send</button>
      </div>
    </div>
  );
};

export default ChatComponent;
