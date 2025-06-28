import { stream } from "hono/streaming";
import type { Handler } from "hono";
import { createDataStream, formatDataStreamPart } from "ai";
import { MainAgent } from "../agents/main.js";
import type { IRunContext } from "../types/context.js";
import { getCookie, setCookie } from "hono/cookie";
import { nanoid } from "nanoid";
import {} from "../lib/cache/tool.js";
import { sessionMemoryManager } from "../lib/cache/session.js";
import { s3 } from "../lib/memory-s3/index.js";
import { NL2SQLDataService } from "../data/service.js";

export const Chat: Handler = async (c) => {
  const { messages, fileKey } = await c.req.json();

  const runContext: IRunContext = {
    cookie: c.req.header("Cookie"),
    view: c.req.header("X-FORM-VIEW") || "",
    env: c.req.header("X-ENV") || "",
    origin: c.req.header("Origin") || "",
    history: messages.slice(-10), // TODO opt
    s3,
    presetId: c.req.header("X-DATA-PRESET") || "kuaida",
  };

  if (fileKey) {
    runContext.presetOptions = {
      fileKey,
    };
  }

  runContext.dataSvc = new NL2SQLDataService(runContext);

  const agent = new MainAgent(runContext);
  const result = await agent.run();

  let sessionId = getCookie(c, "chatSessionId");
  if (!sessionId) {
    sessionId = nanoid(16);
    setCookie(c, "chatSessionId", sessionId, {
      httpOnly: true,
      maxAge: 3600,
    });
  }
  runContext.memory = sessionMemoryManager.get(sessionId);

  // Mark the response as a v1 data stream:
  c.header("X-Vercel-AI-Data-Stream", "v1");
  c.header("Content-Type", "text/plain; charset=utf-8");
  c.header("X-Accel-Buffering", "no");

  //   return stream(c, (stream) => stream.pipe(result.toDataStream()));

  const resp = createDataStream({
    execute: async (dataStream) => {
      const lastMessage = messages[messages.length - 1];

      lastMessage.parts = await Promise.all(
        // map through all message parts
        lastMessage.parts?.map(async (part) => {
          if (part.type !== "tool-invocation") {
            return part;
          }
          const toolInvocation = part.toolInvocation;
          // return if tool isn't weather tool or in a result state
          if (
            toolInvocation.toolName !== "query-data" ||
            toolInvocation.state !== "result"
          ) {
            return part;
          }

          // switch through tool result states (set on the frontend)
          switch (toolInvocation.result) {
            case "CONFIRM": {
              const result = await agent.tools["query-data"].confirmExecute?.(
                toolInvocation.args,
                {
                  toolCallId: toolInvocation.toolCallId,
                  messages: runContext.history,
                }
              );

              // forward updated tool result to the client:
              dataStream.write(
                formatDataStreamPart("tool_result", {
                  toolCallId: toolInvocation.toolCallId,
                  result,
                })
              );

              // update the message part:
              return { ...part, toolInvocation: { ...toolInvocation, result } };
            }
            case "CANCEL": {
              const result = "Error: 用户取消了数据查询执行";

              // forward updated tool result to the client:
              dataStream.write(
                formatDataStreamPart("tool_result", {
                  toolCallId: toolInvocation.toolCallId,
                  result,
                })
              );

              // update the message part:
              return { ...part, toolInvocation: { ...toolInvocation, result } };
            }
            default:
              return part;
          }
        }) ?? []
      );

      result.mergeIntoDataStream(dataStream);
    },
  });

  return stream(c, (stream) => stream.pipe(resp));
};
