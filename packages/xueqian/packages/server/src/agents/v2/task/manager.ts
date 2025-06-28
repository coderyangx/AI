import { nanoid } from "nanoid";
import { IRunContext } from "../../../types/context";
import {
  EAssistantMessageType,
  IAgentTask,
} from "../../../types/deep-analysis/index";
import { AgentTaskRunner } from "./runner.js";
import { EventEmitter } from "events";
import { IPlanningAgentInput, IPlanningAgentOutput } from "../planning.js";
import { IAnalysisAgentInput, IAnalysisAgentOutput } from "../analysis.js";
import {
  ISummarizingAgentInput,
  ISummarizingAgentOutput,
} from "../summarizing";

type IPlanningAgentTask = IAgentTask<IPlanningAgentInput, IPlanningAgentOutput>;
type IAnalysisAgentTask = IAgentTask<
  IAnalysisAgentInput,
  IAnalysisAgentOutput,
  { stepIndex: number }
>;
type ISummarizingAgentTask = IAgentTask<
  ISummarizingAgentInput,
  ISummarizingAgentOutput
>;

export class AgentTaskManager extends EventEmitter {
  private ctx: IRunContext;
  private messageId: string;
  private responseType: EAssistantMessageType;

  constructor(ctx: IRunContext) {
    super();
    this.ctx = ctx;
    this.messageId = nanoid(16);
    this.responseType = EAssistantMessageType.NORMAL;
    this.rootTask = {
      id: nanoid(10),
      stage: "start",
      status: "PENDING",
    };
    this.taskMap.set(this.rootTask.id, this.rootTask as IAgentTask);
  }

  rootTask: IAgentTask<never, string, never>;

  planningTasks: IPlanningAgentTask[]; // 可能涉及重新规划，所以用数组，但是前台只会展示第一个的输出

  analysisTasks: IAnalysisAgentTask[];

  summarizingTask: ISummarizingAgentTask;

  taskMap: Map<string, IAgentTask> = new Map();

  async start() {
    const runner = new AgentTaskRunner(this.rootTask as IAgentTask, this.ctx);
    this.listeningRunner(runner);
    runner.run();
  }

  // 监听 agent runner 执行状态/进度更新
  private listeningRunner = (runner: AgentTaskRunner) => {
    runner.once("start", ({ taskId }) => {
      const task = this.taskMap.get(taskId);
      if (!task) {
        return;
      }
      task.status = "RUNNING";

      if (task.stage === "planning") {
        // 发送一个 planning 开始的 ws 消息
        const message = this.generateWsDataAnalysisResponseMessage(
          this.rootTask.output ?? "", // 当对话过程意图识别到 planning agent 调用时，已经回复的文本内容直接作为 planning 阶段的介绍
          false,
          "start"
        );
        this.emit("message", message);
      } else if (task.stage === "analysis") {
        const currentTask = task as IAnalysisAgentTask;
        // 发送一个单个数据分析任务节点 开始的 ws 消息
        const message = this.generateWsDataAnalysisResponseMessage(
          currentTask.input?.current_task?.objective ?? "", // TODO short goal
          false,
          "header"
        );
        this.emit("message", message);
      } else if (task.stage === "summarizing") {
        const currentTask = task as ISummarizingAgentTask;
        // 发送一个最终总结阶段开始的 ws 消息
        const message = this.generateWsDataAnalysisResponseMessage(
          "",
          false,
          "final"
        );
        this.emit("message", message);
      }

      // stage === 'start' 不用发送 ws 消息，让前端 loading 等待即可，前端等待的第一条信息应该是 1）自然对话的回复 chunk 2）planning 意图命中开始调用 planning agent 的启动消息
    });

    runner.once("complete", ({ taskId, payload }) => {
      const task = this.taskMap.get(taskId);
      if (!task) {
        return;
      }
      task.status = "COMPLETED";
      task.output = payload as unknown as never;

      if (runner.stage === "start") {
        // 只有这个阶段的 Agent 可能有两种回复消息模式（普通对话消息/数据分析任务展示消息）
        if (this.responseType === EAssistantMessageType.ANALYSIS) {
          // 不需要处理，因为触发了 planning，数据分析任务展示消息的第一个节点是 planning，而不是 start
        } else if (this.responseType === EAssistantMessageType.NORMAL) {
          const message = this.generateWsDialogResponseMessage("", true);
          this.emit("message", message);
        }
      } else if (runner.stage === "planning") {
        const message = this.generateWsDataAnalysisResponseMessage(
          "",
          true,
          "start"
        );
        this.emit("message", message);
      } else if (runner.stage === "analysis") {
        const message = this.generateWsDataAnalysisResponseMessage(
          "",
          true,
          "summary"
        );
        this.emit("message", message);
      } else if (runner.stage === "summarizing") {
        const message = this.generateWsDataAnalysisResponseMessage(
          "",
          true,
          "final"
        );
        this.emit("message", message);
      }

      // 检查下全部任务状态，看是否可以进入新阶段
      this.proceedStage(task);
    });

    runner.once("error", ({ taskId, error }) => {
      const task = this.taskMap.get(taskId);
      if (!task) {
        return;
      }
      task.status = "FAILED";

      // TODO 支持重新规划新任务
      // 检查下全部任务状态，看是否可以进入新阶段
      this.proceedStage(task);
    });

    runner.once("cancel", ({ taskId, reason }) => {
      const task = this.taskMap.get(taskId);
      if (!task) {
        return;
      }
      task.status = "CANCELLED";

      // 检查下全部任务状态，看是否可以进入新阶段
      this.proceedStage(task);
    });

    // runner routing，目前只有 ChatAgent 通过意图识别路由到 PlanningAgent
    runner.on(
      "routing",
      ({
        parentTaskId,
        stage: nextStage,
        input,
      }: {
        parentTaskId: string;
        stage: "planning";
        input: IPlanningAgentInput;
      }) => {
        const parent = this.taskMap.get(parentTaskId);
        if (!parent || parent.stage !== "planning") {
          return;
        }

        // 命中了数据分析任务规划，不再是自然对话回复了
        this.responseType = EAssistantMessageType.ANALYSIS;

        const newTask: IPlanningAgentTask = {
          id: nanoid(10),
          stage: nextStage,
          status: "PENDING",
          input,
        };
        this.planningTasks.push(newTask);
        this.taskMap.set(newTask.id, newTask as IAgentTask);
        const subRunner = new AgentTaskRunner(newTask as IAgentTask, this.ctx);
        this.listeningRunner(subRunner);
        subRunner.run();
      }
    );

    // runner progress (chunk)
    runner.on("progress", ({ taskId, payload }) => {
      if (runner.stage === "start") {
        const task = this.taskMap.get(taskId) as IAgentTask<
          never,
          string,
          never
        >;
        task.output += payload;
        if (this.responseType === EAssistantMessageType.ANALYSIS) {
          // 从普通对话回复切换到 planning 分析模式的时候，不会有 progress 事件，因为 chat agent 已经因为触发 planning tool 而结束
        } else if (this.responseType === EAssistantMessageType.NORMAL) {
          const message = this.generateWsDialogResponseMessage(payload, false);
          this.emit("message", message);
        }
      } else if (runner.stage === "planning") {
        // planning 阶段直接由最终 finish 事件触发 ws 消息，没有中间过程的更新
      } else if (runner.stage === "analysis") {
        const task = this.taskMap.get(taskId) as IAnalysisAgentTask;
        const message = this.generateWsDataAnalysisResponseMessage(
          payload,
          false,
          "summary",
          task?.meta.stepIndex
        );
        this.emit("message", message);
      } else if (runner.stage === "summarizing") {
        const message = this.generateWsDataAnalysisResponseMessage(
          payload,
          false,
          "final"
        );
        this.emit("message", message);
      }
    });
  };

  // 当一个任务完成/取消/异常后，检查整体任务状态，确认是否进入新阶段或整体结束
  private proceedStage = (currentTask: IAgentTask) => {
    const markEnd = () => {
      const message = this.generateWsDataAnalysisResponseMessage(
        "",
        true,
        "end"
      );
      this.emit("message", message);
    };

    const markError = (error: Error | string) => {
      const message = this.generateWsErrorResponseMessage(error);
      this.emit("message", message);
    };

    const markCancelled = (reason = "用户终止了任务") => {
      const message = this.generateWsErrorResponseMessage(reason);
      this.emit("message", message);
    };

    if (currentTask.stage === "start" && currentTask.status === "CANCELLED") {
      markCancelled();
    } else if (currentTask.stage === "planning") {
      if (currentTask.status === "COMPLETED") {
        const tasks = currentTask.output as IPlanningAgentOutput["tasks"];
        for (const task of tasks) {
          this.submitAnalysisTask(task, tasks);
        }
      } else if (currentTask.status === "FAILED") {
        markError(currentTask.error);
      } else if (currentTask.status === "CANCELLED") {
        markCancelled();
      }
    } else if (currentTask.stage === "analysis") {
      if (this.analysisTasks.every((task) => task.status === "COMPLETED")) {
        this.submitSummarizingTask();
      }
      // TODO 任务不完全成功的场景，是否重新规划或者直接终止整体流程
    } else if (currentTask.stage === "summarizing") {
      if (currentTask.status === "COMPLETED") {
        markEnd();
      } else if (currentTask.status === "FAILED") {
        markError(currentTask.error);
      } else if (currentTask.status === "CANCELLED") {
        markCancelled();
      }
    }
  };

  private submitAnalysisTask = (
    task: IPlanningAgentOutput["tasks"][number],
    tasks: IPlanningAgentOutput["tasks"]
  ) => {
    const newTask: IAnalysisAgentTask = {
      id: task.task_id || nanoid(10),
      stage: "analysis",
      status: "PENDING",
      input: {
        current_task: task,
        tasks,
      },
      meta: {
        stepIndex: this.analysisTasks.length,
      },
    };
    this.analysisTasks.push(newTask);
    this.taskMap.set(newTask.id, newTask as IAgentTask);

    const subRunner = new AgentTaskRunner(newTask as IAgentTask, this.ctx);
    this.listeningRunner(subRunner);
    subRunner.run();
  };

  private submitSummarizingTask = () => {
    const newTask: ISummarizingAgentTask = {
      id: nanoid(10),
      stage: "summarizing",
      status: "PENDING",
      input: {
        user_query: this.planningTasks[0].input.user_query,
        analysis_tasks: this.analysisTasks.map(
          (task) => task.input.current_task
        ),
        analysis_results: this.analysisTasks.map((task) => task.output),
      },
    };
    this.summarizingTask = newTask;
    this.taskMap.set(newTask.id, newTask as IAgentTask);

    const subRunner = new AgentTaskRunner(newTask as IAgentTask, this.ctx);
    this.listeningRunner(subRunner);
    subRunner.run();
  };

  async stop() {}

  // helpers
  generateWsDialogResponseMessage(token: string, stop?: boolean) {
    return JSON.stringify({
      conversationId: this.ctx.sessionId,
      messageId: this.messageId,
      timestamp: Date.now(),
      type: EAssistantMessageType.NORMAL,
      payload: {
        token,
        stop: stop ?? false,
      },
    });
  }

  generateWsDataAnalysisResponseMessage(
    token: string,
    stop?: boolean,
    messageTag?: "start" | "header" | "summary" | "final" | "end",
    stepIndex?: number
  ) {
    return JSON.stringify({
      conversationId: this.ctx.sessionId,
      messageId: this.messageId,
      timestamp: Date.now(),
      type: EAssistantMessageType.ANALYSIS,
      payload: {
        token,
        stop: stop ?? false,
        messageTag,
        stepIndex,
      },
    });
  }

  generateWsErrorResponseMessage(error: Error | string) {
    return JSON.stringify({
      conversationId: this.ctx.sessionId,
      messageId: this.messageId,
      timestamp: Date.now(),
      type: EAssistantMessageType.ERROR,
      payload: {
        message: typeof error === "string" ? error : error.message,
      },
    });
  }
}

// TODO 支持从已有 taskId 恢复状态
