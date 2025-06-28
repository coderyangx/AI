import type { Tool } from "ai";
import type { IRunContext } from "./context.js";

export type IExtendedTool = Tool & {
  name: string;
  confirmExecute?: Tool["execute"];
};

export type IToolFactory = (ctx: IRunContext) => IExtendedTool;
