// packages/types/src/index.ts
export interface AgentInvokePayload {
  prompt: string;
}

export interface AgentResponse {
  response: string;
  sources?: string[];
  error?: string;
}
