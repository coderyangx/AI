import {
  type LanguageModelV1,
  type StreamTextResult,
  streamText,
  TextStreamPart,
} from "ai";
import type { IAgent } from "../../types/agent.js";
import type { IRunContext } from "../../types/context.js";
import { getModel } from "../../lib/ai/model-provider.js";
import { IExtendedTool } from "../../types/tool.js";
import { PlanningAgent } from "./planning.js";

// 6 - **主动确认：** 在关键步骤（如确定分析目标、执行复杂操作）前，主动总结你的理解并寻求用户确认，避免方向性错误。

export class ChatAgent<TOOLS extends Record<string, IExtendedTool>>
  implements IAgent<TOOLS, string>
{
  name: string;
  description: string;
  instructions: (ctx: IRunContext) => Promise<string> = async (ctx) => {
    const tableInfo = await ctx.dataSvc?.getDataSchema();
    return `-----

你是一个资深的数据分析专家，专注于从结构化数据中提取洞察。你的核心职责是**理解用户的意图**，并引导他们进行有效的数据查询与分析。你会严格按照以下流程与用户互动：

1.  **分析用户提问意图**：

      * **判断是否与数据查询分析相关**：如果用户的提问与数据查询、数据分析、报表生成、数据可视化、数据趋势预测、数据清洗、数据聚合、统计分析等**无关**，你将立即回复用户，明确要求他们提出与数据查询分析相关的问题。
      * **识别信息缺失或歧义**：如果用户的问题与数据查询分析**相关**，但：
          * **缺少关键信息**：例如，未指定需要分析的特定表格、列，未说明时间范围，未提供筛选条件，未明确期望的输出格式（如“我需要客户列表”——是所有客户吗？需要哪些字段？）。
          * **存在歧义**：例如，“分析销售数据”——是总销售额？销售趋势？按产品分类？按地区？“哪个产品卖得最好”——是按数量还是金额？是特定时间段吗？
      * **上下文**：你已经掌握了以下数据表结构信息，并应在判断和提问时充分利用这些信息：
        \`\`\`
        ${JSON.stringify(tableInfo)}
        \`\`\`

2.  **引导用户澄清与补齐信息**：

      * 当发现信息缺失或歧义时，你将**清晰、具体、有礼貌地向用户提出问题**，引导他们补充或澄清。你的问题应基于已有的数据表结构信息。
      * 你的目标是让用户提供一个**明确、无歧义、可直接执行分析**的查询请求。
      * **不要尝试猜测用户的意图**。如果疑问没有消除，就继续提问，直到所有关键信息都已明确。

3.  **调用规划工具 (Planning Tool)**：

      * **只有当用户的所有疑问都被澄清，并且你认为可以开始执行数据分析任务时**，你才会终止与用户的互动，并调用你的\*\*\`analysis_planning_tool\`\*\*来拆解数据分析任务。
      * 在调用 \`analysis_planning_tool\` 之前，你**绝不会**提前执行任何数据查询或分析操作。

**重要提示**：

  * 你的核心价值在于**精确理解意图和引导沟通**，而非在不确定时盲目执行。
  * 始终保持专业、耐心和清晰的沟通风格。
-----
`;
  };

  model: LanguageModelV1;
  tools: TOOLS;
  ctx: IRunContext;

  constructor(ctx: IRunContext) {
    this.name = "chat";
    this.description = "";
    this.ctx = ctx;
    this.model = getModel("gpt-4.1");

    const planningAgent = new PlanningAgent(ctx);

    this.tools = {
      ...planningAgent.asRoutingMap(),
    } as TOOLS;
  }

  async run(options: {
    onProgress: (progress: TextStreamPart<TOOLS>) => void;
    onComplete: (result: string) => void;
    onFail: (error: Error) => void;
  }): Promise<StreamTextResult<TOOLS, never>> {
    console.log("chat agent run");
    const messages = this.ctx.history || [];
    const system = await this.instructions(this.ctx);

    const ret = streamText({
      model: this.model,
      messages,
      maxSteps: 1,
      temperature: 0.5,
      system,
      tools: this.tools,
      providerOptions: {
        openai: {
          parallelToolCalls: false,
        },
      },
      onChunk: ({ chunk }) => {
        options.onProgress(chunk);
      },
      onFinish: (ret) => {
        options.onComplete(ret.text);
      },
      onError: ({ error }) => {
        console.log(error);
        options.onFail(
          error instanceof Error ? error : new Error(error as string)
        );
      },
    });

    return ret;
  }
}
