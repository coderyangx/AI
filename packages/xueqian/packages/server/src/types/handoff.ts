import { z } from "zod";
import type { IRunContext } from "./context.js";
import type { IAgent } from "./agent.js";

export interface IHandOffOptions {
  toolName?: string;
  toolDescription?: string;
  inputSchema?: z.AnyZodObject;
  ctx: IRunContext;
  agent: IAgent;
}
