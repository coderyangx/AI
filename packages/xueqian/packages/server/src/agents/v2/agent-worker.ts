import { NL2SQLDataService } from "../../data/service.js";
import { IRunContext } from "../../types/context.js";
import { IAgentTask } from "../../types/deep-analysis/task.js";
import { parentPort } from "worker_threads";
import { ChatAgent } from "./chat.js";
import { PlanningAgent } from "./planning.js";
import { AnalysisAgent } from "./analysis.js";
import { SummarizingAgent } from "./summarizing.js";
import { IAgent } from "../../types/agent.js";
import { StreamTextResult } from "ai";

const supportedAgentRoutings = ["planning"];

if (!parentPort) {
  throw new Error("This script must be run as a worker thread.");
}

const getAgent = (stage: IAgentTask["stage"]) => {
  const workerNameMap: Record<
    IAgentTask["stage"],
    new (ctx: IRunContext) => IAgent
  > = {
    start: ChatAgent,
    planning: PlanningAgent,
    analysis: AnalysisAgent,
    summarizing: SummarizingAgent,
  };

  return workerNameMap[stage];
};

parentPort.once(
  "message",
  async (msg: {
    type: "start" | "terminate";
    payload: IAgentTask;
    ctx: IRunContext;
  }) => {
    if (msg.type === "start") {
      const data = msg.payload;
      console.log(
        `Worker received start message with data: ${JSON.stringify(data)}`
      );

      const ctx = msg.ctx;
      ctx.dataSvc = new NL2SQLDataService(ctx);

      const Agent = getAgent(data.stage);
      if (!Agent) {
        parentPort.postMessage({
          type: "onError",
          payload: "未找到合适的 Agent 来运行任务",
        });
        return;
      }
      const agent = new Agent(ctx);

      try {
        const result = await agent.run({
          input: data.input,
          onProgress: (chunk) => {
            console.log("onChunk", chunk);
            if (chunk.type === "text-delta") {
              parentPort.postMessage({
                type: "onChunk",
                payload: chunk.textDelta,
              });
            } else if (chunk.type === "tool-call") {
              const agentName = chunk.toolName.replace("handoff.", "");
              if (supportedAgentRoutings.includes(agentName)) {
                parentPort.postMessage({
                  type: "onRouting",
                  payload: {
                    agent: agentName,
                    input: chunk.args,
                  },
                });
              }
            }
          },
          onComplete: (ret) => {
            console.log("onFinish");
            parentPort.postMessage({
              type: "onFinish",
              payload: ret,
            });
          },
          onFail: (error) => {
            console.log("onError", error);
            parentPort.postMessage({
              type: "onError",
              payload: error.message,
            });
          },
        });

        if ((result as StreamTextResult<any, any>).toDataStream) {
          const stream = (result as StreamTextResult<any, any>).toDataStream();

          const reader = stream.getReader();

          while (true) {
            const { done } = await reader.read();
            if (done) {
              break;
            }
          }
        } else {
          console.log("onFinish");
          parentPort.postMessage({
            type: "onFinish",
            payload: result,
          });
        }
      } catch (e) {
        parentPort.postMessage({
          type: "onError",
          payload: e,
        });
      }
    } else if (msg.type === "terminate") {
      console.log("worker exit by command");
      process.exit(0);
    }
  }
);

parentPort.postMessage({ type: "ready" });

console.log("Child Worker process started.");
