import { useState } from 'react';
import { format } from 'date-fns';
import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';
import './App.css';

// 引入共享类型！
import type { AgentResponse } from '../../types';

function App() {
  const [prompt, setPrompt] = useState<string>('Hello from React+Vite!');
  const [agentResponse, setAgentResponse] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setAgentResponse('');

    try {
      const res = await fetch('http://localhost:8000/api/v1/agent/invoke', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      // 使用共享类型来约束返回的数据
      const data: AgentResponse = await res.json();
      const date = format(new Date(), 'yyyy-MM-dd HH:mm:ss');
      setAgentResponse(date + data.response);
    } catch (error) {
      const date = format(new Date(), 'yyyy-MM-dd HH:mm:ss');
      console.error('Failed to fetch from agent:', error);
      setAgentResponse(date + 'Error: Could not connect to the agent.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <h1>Client</h1>
      <form onSubmit={handleSubmit}>
        <input
          type='text'
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          style={{ width: '300px', marginRight: '10px' }}
        />
        <button type='submit' disabled={isLoading}>
          {isLoading ? 'Thinking...' : 'Send to Agent'}
        </button>
      </form>

      {agentResponse && (
        <div className='card'>
          <h3>Agent Response:</h3>
          <p>{agentResponse}</p>
        </div>
      )}
    </>
  );
}

export default App;
