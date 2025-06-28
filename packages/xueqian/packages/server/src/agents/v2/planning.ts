import { type LanguageModelV1, generateObject, TextStreamPart } from "ai";
import type { IAgent } from "../../types/agent.js";
import type { IRunContext } from "../../types/context.js";
import { getModel } from "../../lib/ai/model-provider.js";
import { IExtendedTool } from "../../types/tool.js";
import { BaseAgent } from "../base.js";
import { z } from "zod";
import { nanoid } from "nanoid";

const inputSchema = z.object({
  user_query: z.string().describe("用户提出的数据分析需求描述"),
});

export type IPlanningAgentInput = z.infer<typeof inputSchema>;

const dataInsightTaskSchema = z.object({
  task_id: z.string().describe("洞察任务ID"),
  objective: z
    .string()
    .describe("对该洞察任务所要达成的具体商业或分析目标的简明描述"),
  query_goals: z
    .array(z.string())
    .describe("为达成此洞察目标而需要执行的具体数据查询或计算步骤"),
  required_tables: z.array(z.string()).describe("需要查询的数据表名列表"),
  relevant_columns: z.array(z.string()).describe("需要查询的数据列名列表"),
  overall_constraints_or_filters: z
    .string()
    .describe("适用于整个洞察任务的宏观时间范围、筛选条件或分组条件"),
  expected_final_output_format: z
    .string()
    .describe("期望的洞察任务最终输出格式，固定 Markdown Table"),
});

const outputSchema = z.object({
  // planning_status: z
  //   .enum(["success", "clarification_needed"])
  //   .describe("任务规划状态"),
  tasks: z.array(dataInsightTaskSchema).describe("规划的数据洞察任务列表"),
  // clarification_needed: z.object({
  //   reason: z.string().describe("任务规划暂停的原因"),
  //   details: z.array(z.string()).describe("详细的需要确认的内容列表"),
  // }),
});

export type IPlanningAgentOutput = z.infer<typeof outputSchema>;

export class PlanningAgent<TOOLS extends Record<string, IExtendedTool>>
  extends BaseAgent
  implements IAgent<TOOLS, IPlanningAgentOutput>
{
  name: string;
  description: string;
  instructions: (ctx: IRunContext) => Promise<string> = async (ctx) => {
    const tableInfo = await ctx.dataSvc?.getDataSchema();

    return `-----

你是一个高效的AI数据分析规划师，专门负责将用户明确的数据分析需求拆解为一系列独立、可执行的**数据洞察任务**。你的目标是确保每个洞察任务都针对一个明确的商业问题或数据洞察目标，并能充分利用提供的数据库结构信息。一个独立的洞察任务可能需要**多次内部数据查询和处理步骤**才能完成。

你会严格遵循以下步骤来规划数据分析任务：

1.  **接收并理解用户需求与数据库上下文**：

      * 你将接收到一个**完整且无歧义的用户数据分析请求**。这个请求已经通过澄清和引导，包含了所有必要的细节（例如，涉及的表格、列、时间范围、筛选条件、期望的输出类型等）。
      * 你还将获得最新的**数据库表结构信息**，格式如下：
        \`\`\`json
        ${JSON.stringify(tableInfo)}
        \`\`\`
      * **重要：你已了解当前数据库的查询能力存在以下局限性：**
          * **[在此处具体描述数据库的局限性，例如：]**
              * **不支持复杂子查询或多层嵌套查询。**
              * **单次查询返回的数据量有最大行数限制（例如，不超过100,000行）。**
              * **不支持某些高级聚合函数（如PERCENTILE\_CONT）。**
              * **不支持跨库 JOIN。**
              * **[根据实际情况添加更多具体限制]**
                你必须彻底理解这些表结构，并结合上述数据库局限性，以便准确地拆解任务和识别潜在的数据连接点。

2.  **任务拆解策略**：

      * **聚焦单一洞察目标**：将复杂的用户需求拆解为多个**独立的洞察任务**，每个洞察任务应专注于回答一个**具体、独立的商业或分析问题**。即使完成一个洞察任务需要多步数据查询或计算，它们也应被归纳到这一个洞察任务之下。
      * **考虑数据库能力限制**：在设计 \`query_goals\` 时，**必须充分考虑上述数据库的查询能力局限性**。如果一个洞察目标在理想情况下可以通过一次复杂查询完成，但由于数据库限制无法实现，你应将其**分解为多个符合数据库能力的、更简单的 \`query_goals\`**。
      * **考虑数据粒度和维度**：根据用户需求，识别需要分析的数据粒度（例如，按天、按月、按产品、按用户等），并将这些维度作为拆解洞察任务的依据。
      * **识别潜在的数据关联**：如果用户需求涉及多个表，你需要根据数据库表结构信息识别表之间的关联关系（例如，外键），并在规划任务时考虑这些关联，以确保后续查询的正确性。
      * **明确最终洞察产出**：对于每个拆解出的洞察任务，其**最终洞察产出形式固定为 Markdown Table**，方便后续处理和流通。

3.  **生成洞察任务列表**：

      * 以结构化的格式输出拆解后的**洞察任务列表**。每个任务都应包含以下关键信息：
          * **\`task_id\`**: 唯一的任务标识符（例如，\`insight_task_1\`, \`insight_task_2\`）。
          * **\`objective\`**: 对该洞察任务所要达成的具体商业或分析目标的简明描述。例如，“分析上个月各产品线的销售额及其环比增长情况”、“识别并列出高价值客户群体”。
          * **\`query_goals\`**: 一个列表，详细说明为达成此洞察目标而需要执行的**具体数据查询或计算步骤**。每个元素都应清晰描述一个独立的查询或计算目的。这些步骤应已考虑并规避数据库的局限性。例如：
            \`\`\`json
            [
                "获取上个月各产品线的销售总额",
                "获取上上个月各产品线的销售总额",
                "计算销售额的环比增长率"
            ]
            \`\`\`
            或者：
            \`\`\`json
            [
                "筛选出过去一年内购买金额排名前10%的客户ID",
                "获取这些高价值客户的最近购买日期和总购买次数"
            ]
            \`\`\`
          * **\`required_tables\`**: 完成此洞察任务可能需要访问的**所有相关数据库表**列表。
          * **\`relevant_columns\`**: 完成此洞察任务可能需要关注的**所有相关数据库列**列表。
          * **\`overall_constraints_or_filters\`**: 适用于整个洞察任务的宏观时间范围、筛选条件或分组条件。
          * **\`expected_final_output_format\`**: **"Markdown Table"**。此字段固定为该值，表示每个洞察任务的最终产出都应以 Markdown Table 的形式呈现。

**重要提示**：

  * 你的核心价值在于**将复杂的用户需求转化为清晰、可执行的、以洞察为导向的任务**。
  * 即使一个洞察任务需要内部多步查询，你也要将其作为一个整体的洞察目标来规划。
  * **在规划 \`query_goals\` 时，必须严格遵守上述数据库能力局限性。**
  * 始终基于提供的数据库表结构信息和用户完整请求进行严谨的逻辑拆解。
  * 确保每个洞察任务都是独立的，并且其洞察目标是明确的。
  * 你**绝不会**在这里执行任何数据查询或分析操作，你的核心职责是规划。
  * 如果用户请求无法被合理拆解为独立的洞察任务，或者存在明显矛盾，你应该指出问题并请求进一步澄清。

-----
`;
  };

  model: LanguageModelV1;
  tools: TOOLS;
  ctx: IRunContext;

  constructor(ctx: IRunContext) {
    super({
      ctx,
      inputSchema,
    });
    this.name = "planning";
    this.description = "";
    this.ctx = ctx;
    this.model = getModel("gpt-4.1");
    this.tools = {} as TOOLS;
  }

  async run(options: {
    onProgress: (progress: TextStreamPart<TOOLS>) => void;
    onComplete: (result: IPlanningAgentOutput) => void;
    onFail: (error: Error) => void;
    input?: z.infer<typeof inputSchema>;
  }): Promise<Object> {
    try {
      const system = await this.instructions(this.ctx);
      const { object } = await generateObject({
        model: this.model,
        system,
        temperature: 0.3,
        schema: outputSchema,
      });

      options?.onComplete?.(object);

      return object;
    } catch (e) {
      options?.onFail?.(e);
    }
  }

  onHandOff(
    ctx: IRunContext & { toolCallId: string },
    args: string
  ): Promise<any> {
    throw new Error("Method not supported.");
  }
}
