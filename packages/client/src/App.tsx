import ChatContainerShadcn from './components/shadcn/chat-container';
import ChatContainer from './components/chat/chat-container';

import './App.css';

function App() {
  return (
    <div className='min-h-screen bg-gray-100 p-4'>
      {/* <ChatContainer /> */}
      <ChatContainerShadcn />
    </div>
  );
}

export default App;
