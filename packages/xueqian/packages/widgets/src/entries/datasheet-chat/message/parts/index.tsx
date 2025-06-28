import { TextMessagePart } from "./text";
import { ToolMessagePart } from "./tool";

export function MessagePart({ message, part, addToolResult }) {
  if (part.type === "text") {
    return <TextMessagePart message={message} part={part} />;
  }
  if (part.type === "tool-invocation") {
    return (
      <ToolMessagePart
        message={message}
        part={part}
        addToolResult={addToolResult}
      />
    );
  }

  return null;
}
