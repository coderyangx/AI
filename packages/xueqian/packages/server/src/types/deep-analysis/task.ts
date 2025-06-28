export interface IAgentTask<T = never, O = never, M = never> {
  id: string;
  stage: "start" | "planning" | "analysis" | "summarizing";
  status: TaskStatus;
  input?: T;
  output?: O;
  meta?: M; // 包括 stepIndex
  error?: string;
}

type TaskStatus = "PENDING" | "RUNNING" | "COMPLETED" | "FAILED" | "CANCELLED";
