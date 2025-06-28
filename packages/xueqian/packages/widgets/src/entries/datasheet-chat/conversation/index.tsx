import type { Message } from "@ai-sdk/react";
import { ChatMessage } from "../message";

interface IConversationProps {
  messages: Message[];
  addToolResult: (options: { toolCallId: string; result: any }) => void;
  loading?: boolean;
  pending?: boolean;
  error?: Error;
}

export default function Conversation(props: IConversationProps) {
  const { messages, addToolResult, loading, pending, error } = props;

  return (
    <div id="conversation-scroll" className="w-full h-full overflow-auto py-6">
      {messages.map((message, index) => {
        const currentMsgLoading = loading && index + 1 === messages.length;
        return (
          <ChatMessage
            key={message.id}
            message={message}
            loading={currentMsgLoading}
            error={index + 1 === messages.length ? error : null}
            addToolResult={addToolResult}
          />
        );
      })}
      {pending && (
        <div className="chat-message-wrap flex flex-col mb-6 text-sm assistant items-start">
          <div className="message-bubble bg-gray-100 rounded-lg py-3 px-4 relative text-sm text-gray-600">
            <span className="inline-dots-wrapper">
              <span className="loading-dots">
                <span className="dot"></span>
                <span className="dot"></span>
                <span className="dot"></span>
              </span>
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
