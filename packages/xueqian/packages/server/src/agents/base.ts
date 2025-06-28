import type { Tool } from "ai";
import type { IRunContext } from "../types/context.js";
import { z } from "zod";

export interface IBaseAgentOptions {
  inputSchema?: z.AnyZodObject;
  ctx: IRunContext;
}

export abstract class BaseAgent {
  protected options: IBaseAgentOptions;
  protected name: string;
  protected description: string;

  protected get toolName() {
    return `handoff.${this.name}`;
  }

  protected get toolDescription() {
    return `Handoff to the ${this.name} agent to handle the request. ${
      this.description ?? ""
    }`;
  }

  constructor(options: IBaseAgentOptions) {
    this.options = options;
  }

  asToolMap(): { [name: string]: Tool } {
    return {
      [this.toolName]: {
        type: "function",
        description: this.toolDescription,
        parameters: this.options.inputSchema || z.object({}),
        execute: async (args, options) => {
          console.log(args);
          try {
            return await this.onHandOff(
              {
                ...this.options.ctx,
                history: options.messages,
                toolCallId: options.toolCallId,
              },
              JSON.stringify(args)
            );
          } catch (e) {
            console.log(e);
            return {
              isError: true,
              error: e.message,
            };
          }
        },
      },
    };
  }

  asRoutingMap(): { [name: string]: Tool } {
    return {
      [this.toolName]: {
        type: "function",
        description: this.toolDescription,
        parameters: this.options.inputSchema || z.object({}),
      },
    };
  }

  abstract onHandOff(
    ctx: IRunContext & { toolCallId: string },
    args: string
  ): Promise<any>;
}
