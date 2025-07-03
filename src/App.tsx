import ChatContainerShadcn from './pages/chat-shadcn' // shadcn

import './App.css'

function App() {
  console.log('App: process.env', import.meta.env.VITE_API_BASE, import.meta.env.VITE_OPEN_API_KEY)

  return (
    <div className='min-h-screen bg-gray-100 p-4'>
      {/* <ChatContainer /> */}
      {/* <ChatGemini /> */}

      {/* <h3>express后端</h3> */}
      <ChatContainerShadcn />

      {/* <h3>hono后端</h3> */}
      {/* <ChatComponent /> */}
    </div>
  )
}

export default App
