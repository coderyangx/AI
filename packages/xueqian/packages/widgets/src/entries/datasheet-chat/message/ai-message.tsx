import type { Message } from "@ai-sdk/react";
import { MessagePart } from "./parts";

export function AIMessage({
  message,
  loading,
  addToolResult,
}: {
  message: Message;
  loading?: boolean;
  addToolResult?: (options: { toolCallId: string; result: any }) => void;
}) {
  return (
    <div className="message-bubble bg-gray-100 rounded-lg py-3 px-4 relative text-sm text-gray-600 min-w-4/5 max-w-4/5">
      <div className="prose prose-neutral prose-sm text-sm prose-ol:my-1 prose-ul:my-1 prose-p:my-1 prose-li:leading-5 text-medium break-words">
        {message.parts.map((part, index) => {
          if (part.type === "step-start") {
            return null;
          }
          return (
            <div className={`message-part part-${part.type}`} key={index}>
              <MessagePart
                message={message}
                part={part}
                addToolResult={addToolResult}
              />
            </div>
          );
        })}
      </div>
      {loading && (
        <span className="inline-dots-wrapper">
          <span className="loading-dots">
            <span className="dot"></span>
            <span className="dot"></span>
            <span className="dot"></span>
          </span>
        </span>
      )}
    </div>
  );
}
