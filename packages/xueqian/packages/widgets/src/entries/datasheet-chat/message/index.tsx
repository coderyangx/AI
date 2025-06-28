import type { Message } from "@ai-sdk/react";
import { AIMessage } from "./ai-message";
import clsx from "clsx";
import "./index.less";

function UserMessage({ message }: { message: Message }) {
  return (
    <div className="message-bubble bg-blue-500 rounded-lg py-3 px-4 relative text-white text-sm max-w-4/5">
      {message.content}
    </div>
  );
}

export function ChatMessage(props: {
  message: Message;
  loading?: boolean;
  error?: Error;
  addToolResult?: (options: { toolCallId: string; result: any }) => void;
}) {
  const { message, loading, error, addToolResult } = props;

  return (
    <div
      className={clsx(
        "chat-message-wrap flex flex-col mb-6 text-sm",
        message.role,
        message.role === "user" ? "items-end" : "items-start"
      )}
    >
      {message.role === "user" ? (
        <UserMessage message={message} />
      ) : (
        <AIMessage
          message={message}
          loading={loading}
          addToolResult={addToolResult}
        />
      )}
      {!!error && (
        <div className="error-hint bg-red-100 text-red-500 text-xs p-2 mt-2 rounded">
          {error?.message}
        </div>
      )}
    </div>
  );
}
