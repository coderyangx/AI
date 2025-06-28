import type {
  LanguageModelV1,
  StreamTextResult,
  ToolChoice,
  ToolSet,
  TextStreamPart,
} from "ai";
import type { IRunContext } from "./context.js";

export interface IAgent<TOOLS extends ToolSet = ToolSet, O = any> {
  name: string;
  description: string;
  instructions: string | ((ctx: IRunContext) => string | Promise<string>);
  model: LanguageModelV1;
  tools: TOOLS;
  run(options: {
    // maxSteps?: number;
    // toolChoice?: ToolChoice<TOOLS>;
    input?: any;
    // onChunk?: StreamTextOnChunkCallback<TOOLS>;
    // onStepFinish?: StreamTextOnStepFinishCallback<TOOLS>;
    // onFinish?: StreamTextOnFinishCallback<TOOLS>;
    // onError?: StreamTextOnErrorCallback;
    onProgress: (progress: TextStreamPart<TOOLS>) => void;
    onComplete: (result: O) => void;
    onFail: (error: Error) => void;
  }):
    | Promise<StreamTextResult<TOOLS, never>>
    | Promise<object>
    | Promise<string>;
}
