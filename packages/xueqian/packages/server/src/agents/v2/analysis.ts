import { LanguageModelV1, TextStreamPart, streamText } from "ai";
import { IAgent } from "../../types/agent.js";
import { IRunContext } from "../../types/context.js";
import { IExtendedTool } from "../../types/tool.js";
import { BaseAgent } from "../base.js";
import { IPlanningAgentOutput } from "./planning.js";
import { getModel } from "../../lib/ai/model-provider.js";
import { designAndQueryDataToolFactory } from "../../tools/v2/design-and-query-data.js";

export interface IAnalysisAgentInput {
  tasks: IPlanningAgentOutput["tasks"];
  current_task: IPlanningAgentOutput["tasks"][number];
}

export type IAnalysisAgentOutput = string;

export class AnalysisAgent<TOOLS extends Record<string, IExtendedTool>>
  extends BaseAgent
  implements IAgent<TOOLS, IAnalysisAgentOutput>
{
  name: string;
  description: string;
  instructions: (ctx: IRunContext) => Promise<string> = async (ctx) => {
    return `你是一个资深的数据分析执行专家，你的核心职责是接收由规划 Agent 拆解出的**独立数据洞察任务**，并严格按照任务要求，协调 \`design-and-query-data\` 工具来逐步获取所需数据，最终完成整个洞察目标的分析与输出。

你会严格遵循以下流程来执行数据洞察任务：

1.  **接收并理解洞察任务**：
    * 你将接收一个**完整的结构化洞察任务**。该任务由 Planning Agent 精心规划，包含：
        * \`task_id\`: 任务唯一标识符。
        * \`objective\`: 洞察任务的整体目标。
        * \`query_goals\`: 一个列表，包含为达成目标所需执行的**所有具体查询或计算步骤**。
        * \`required_tables\`: 任务涉及的所有相关数据库表。
        * \`relevant_columns\`: 任务涉及的所有相关数据库列。
        * \`overall_constraints_or_filters\`: 适用于整个任务的宏观约束条件。
        * \`expected_final_output_format\`: 固定为 "Markdown Table"。

2.  **按序执行查询目标**：
    * 你必须**严格按照 \`query_goals\` 列表中定义的顺序，逐一执行每个查询目标**。
    * 对于列表中的每个 \`query_goal\`，你将**调用你的 \`design-and-query-data\` 工具**。在调用时，你需要精确地构建工具的输入参数：
        * 将 \`task_id\`, \`overall_objective\`, \`required_tables\`, \`relevant_columns\`, \`overall_constraints_or_filters\` 直接从当前洞察任务的顶层信息中传递。
        * 将当前正在处理的 \`query_goal\` 作为 \`current_query_goal\` 参数传递。
    * **严格处理 \`design-and-query-data\` 工具的返回结果**：
        * 如果工具成功返回数据（以 Markdown Table 形式），你将**保存这些数据**，以供后续步骤使用。
        * 如果工具返回错误信息，你必须立即终止当前洞察任务的执行，并将错误信息传递给上游 Agent。**绝不允许继续执行后续查询。**

3.  **数据整合与分析**：
    * 在成功获取所有 \`query_goals\` 所需的数据后，你将负责对这些**数据进行整合、处理和必要的计算**，以达成 \`objective\` 中定义的最终洞察目标。
    * 整合过程应包括但不限于：数据合并、聚合、统计计算（如环比增长）、筛选、排序等。
    * **确保最终结果严格符合 \`objective\` 的要求**。

4.  **生成最终输出**：
    * 将整合和分析后的最终洞察结果，以**严格的 Markdown Table 格式**输出。
    * Markdown Table 的列名应清晰、易懂，数据应准确无误。
    * **你的输出只包含最终的 Markdown Table**，不包含任何解释性文字或额外的对话。

**重要提示**：

* 你的核心价值在于**精确、可靠地执行数据分析任务**，将规划转化为实际的数据洞察。
* **严格遵循 \`query_goals\` 的顺序**，确保数据依赖关系正确。
* 任何 \`design-and-query-data\` 工具返回的错误都应立即导致任务终止，并上报。
* 你不进行任何规划或意图识别，你的职责是**忠实且高效地执行**。
* 确保最终输出的 Markdown Table 格式正确，数据完整且无误。

---
`;
  };

  model: LanguageModelV1;
  tools: TOOLS;
  ctx: IRunContext;

  constructor(ctx: IRunContext) {
    super({
      ctx,
    });
    this.name = "analysis";
    this.description = "";
    this.ctx = ctx;
    this.model = getModel("gpt-4.1");

    const tool = designAndQueryDataToolFactory(ctx);
    this.tools = {
      [tool.name]: tool,
    } as TOOLS; // TODO 数学/日期格式化工具/可视化？
  }

  async run(options: {
    input: IAnalysisAgentInput;
    onProgress: (progress: TextStreamPart<TOOLS>) => void;
    onComplete: (result: IAnalysisAgentOutput) => void;
    onFail: (error: Error) => void;
  }): Promise<Object> {
    const system = await this.instructions(this.ctx);
    const prompt = `请执行分析任务*${options.input.current_task.task_id}*`;

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
