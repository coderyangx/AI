import type { Context } from "hono";
import { WSEvents } from "hono/ws";
import { IRunContext } from "../../types/context";
import { s3 } from "../../lib/memory-s3/index.js";
import { NL2SQLDataService } from "../../data/service.js";
import { getCookie, setCookie } from "hono/cookie";
import { nanoid } from "nanoid";
import {
  ERequestMessageType,
  IWebSocketRequestMessage,
} from "../../types/deep-analysis";
import { executeQuery } from "./query.js";

export const DeepAnalysisChat: (c: Context) => Promise<WSEvents> = async (
  c
) => {
  c.header("X-Accel-Buffering", "no");

  const url = new URL(c.req.url);

  //   return stream(c, (stream) => stream.pipe(result.toDataStream()));

  return {
    onMessage(event, ws) {
      console.log(`Message from client: ${event.data}`);

      if (event.data === "PING") {
        return ws.send("PONG");
      }

      const data = JSON.parse(event.data as string) as IWebSocketRequestMessage;

      if (data.type === ERequestMessageType.QUERY) {
        const { messages, fileKey } = data.payload;
        const sessionId = data.payload.conversationId || nanoid(16);

        const runContext: IRunContext = {
          cookie: c.req.header("Cookie"),
          view: url.searchParams.get("view") || "",
          env: url.searchParams.get("env") || "",
          origin: c.req.header("Origin") || "",
          history: messages.slice(-10), // TODO opt
          s3,
          presetId: url.searchParams.get("preset") || "kuaida",
          sessionId,
        };

        if (fileKey) {
          runContext.presetOptions = {
            fileKey,
          };
        }

        // console.log("runContext", JSON.stringify(runContext));

        runContext.dataSvc = new NL2SQLDataService(runContext);

        executeQuery(runContext, ws);
      } else if (data.type === ERequestMessageType.COMMAND) {
        // TODO
      }
    },
    onClose: () => {
      console.log("Connection closed");
    },
  };
};
