import {
  EAssistantMessageType,
  IAgentTask,
} from "../../../types/deep-analysis/index";
import path from "path";
import { fileURLToPath } from "url";
import { nanoid } from "nanoid";
import { Worker } from "worker_threads";
import { IRunContext } from "../../../types/context";
import EventEmitter from "events";
import { IPlanningAgentInput } from "../planning";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const workerPath = path
  .resolve(__dirname, "../agent-worker.js")
  .replace("/src/", "/dist/");
console.log(`Main thread: Starting worker from ${workerPath}`);

export class AgentTaskRunner extends EventEmitter {
  private task: IAgentTask;
  private ctx: IRunContext;

  get stage() {
    return this.task.stage;
  }

  constructor(task: IAgentTask, ctx: IRunContext) {
    super();
    this.task = task;
    this.ctx = ctx;
  }

  run() {
    this.emit("start", { taskId: this.task.id });
    const worker = new Worker(workerPath);
    worker.on("message", (msg: any) => {
      console.log("Worker message:", msg);
      if (msg.type === "ready") {
        worker.postMessage({
          type: "start",
          payload: this.task,
          ctx: JSON.parse(JSON.stringify(this.ctx)),
        });
      } else if (msg.type === "onChunk") {
        this.emit("progress", {
          taskId: this.task.id,
          payload: msg.payload,
        });
      } else if (msg.type === "onFinish") {
        // ws.send(taskManager.generateWsDialogResponseMessage("", true));
        this.emit("complete", {
          taskId: this.task.id,
          payload: msg.payload, // 必须是 agent 的 output 类型
        });
        worker.postMessage({ type: "terminate" });
        worker.terminate();
      } else if (msg.type === "onError") {
        this.emit("error", {
          taskId: this.task.id,
          payload: msg.payload,
        });
        worker.postMessage({ type: "terminate" });
        worker.terminate();
      } else if (msg.type === "onRouting") {
        console.log("onRouting", msg.payload);
        // ws.send(
        //   taskManager.generateWsDataAnalysisResponseMessage(
        //     JSON.stringify(msg.payload),
        //     false,
        //     "start"
        //   )
        // );
        this.emit("routing", {
          parentTaskId: this.task.id,
          stage: msg.payload.agent,
          input: msg.payload.input,
        });
        worker.postMessage({ type: "terminate" });
        worker.terminate();
      }
    });

    worker.on("error", (err: Error) => {
      console.error("Main thread: Worker error:", err);
    });

    worker.on("exit", (code: number) => {
      if (code !== 0) {
        console.error(`Main thread: Worker stopped with exit code ${code}`);
      } else {
        console.log("Main thread: Worker terminated successfully.");
      }
    });
  }

  on(event: "start", listener: (payload: { taskId: string }) => void): this;
  on(
    event: "progress",
    listener: (payload: { taskId: string; payload: string }) => void
  ): this;
  on(
    event: "complete",
    listener: (payload: { taskId: string; payload: any }) => void
  ): this;
  on(
    event: "error",
    listener: (payload: { taskId: string; payload: string }) => void
  ): this;
  on(
    event: "routing",
    listener: (payload: {
      parentTaskId: string;
      stage: string;
      input: IPlanningAgentInput;
    }) => void
  ): this;
  on(event: string, listener: (...args: any[]) => void): this {
    super.on(event, listener);
    return this;
  }
}
