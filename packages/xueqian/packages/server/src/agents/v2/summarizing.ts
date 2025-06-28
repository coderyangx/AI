import {
  LanguageModelV1,
  ToolChoice,
  StreamTextOnChunkCallback,
  StreamTextOnStepFinishCallback,
  StreamTextOnFinishCallback,
  StreamTextOnErrorCallback,
  StreamTextResult,
  TextStreamPart,
  streamText,
} from "ai";
import { IAgent } from "../../types/agent.js";
import { IRunContext } from "../../types/context.js";
import { IExtendedTool } from "../../types/tool.js";
import { BaseAgent } from "../base.js";
import { IPlanningAgentOutput } from "./planning.js";
import { getModel } from "../../lib/ai/model-provider.js";

export interface ISummarizingAgentInput {
  user_query: string;
  analysis_tasks: IPlanningAgentOutput["tasks"];
  analysis_results: string[];
}

export type ISummarizingAgentOutput = string;

export class SummarizingAgent<TOOLS extends Record<string, IExtendedTool>>
  extends BaseAgent
  implements IAgent<TOOLS, ISummarizingAgentOutput>
{
  name: string;
  description: string;
  instructions: (ctx: IRunContext) => Promise<string> = async (ctx) => {
    return ``; // TODO
  };

  model: LanguageModelV1;
  tools: TOOLS;
  ctx: IRunContext;

  constructor(ctx: IRunContext) {
    super({
      ctx,
    });
    this.name = "summarizing";
    this.description = "";
    this.ctx = ctx;
    this.model = getModel("gpt-4.1");
    this.tools = {} as TOOLS; // 可视化工具
  }

  async run(options: {
    input: ISummarizingAgentInput;
    onProgress: (progress: TextStreamPart<TOOLS>) => void;
    onComplete: (result: ISummarizingAgentOutput) => void;
    onFail: (error: Error) => void;
  }): Promise<Object> {
    const system = await this.instructions(this.ctx);
    const prompt = ``;

    const stream = await streamText({
      model: this.model,
      system,
      prompt,
      temperature: 0.3,
      maxSteps: 10,
      tools: this.tools,
      onChunk: ({ chunk }) => {
        options.onProgress(chunk);
      },
      onFinish: (ret) => {
        options.onComplete(ret.text);
      },
      onError: ({ error }) => {
        options.onFail(
          error instanceof Error ? error : new Error(error as string)
        );
      },
    });

    return stream;
  }

  onHandOff(
    ctx: IRunContext & { toolCallId: string },
    args: string
  ): Promise<any> {
    throw new Error("Method not supported.");
  }
}
