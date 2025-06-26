import ChatContainer from '@/pages/chat-tailwind'; // tailwind
import ChatContainerShadcn from './pages/chat-shadcn'; // shadcn
import ChatGemini from './pages/chat-gemini'; // gemini
import ChatComponent from './lib/aisdk-react-demo/useChat'; // ai-sdk

import './App.css';

function App() {
  return (
    <div className='min-h-screen bg-gray-100 p-4'>
      {/* <ChatContainer /> */}
      {/* <ChatGemini /> */}

      {/* <h3>express后端</h3> */}
      <ChatContainerShadcn />

      {/* <h3>hono后端</h3>
      <ChatComponent /> */}
    </div>
  );
}

export default App;
