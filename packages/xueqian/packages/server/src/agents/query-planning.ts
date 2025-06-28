import { generateObject, LanguageModelV1, ToolSet } from "ai";
import { IAgent } from "../types/agent";
import { IRunContext } from "../types/context";
import { getModel } from "../lib/ai/model-provider.js";
import { IQueryTask, QueryTaskSchema } from "../types/query.js";
import { z } from "zod";
import { nanoid } from "nanoid";
import { BaseAgent } from "./base.js";
import { format } from "date-fns";

export class QueryPlanningAgent extends BaseAgent implements IAgent {
  name: string;
  description: string;
  instructions: (ctx: IRunContext) => Promise<string> = async (ctx) => {
    const tableInfo = await ctx.dataSvc?.getDataSchema();

    return `你是一名专业的数据查询任务规划助手。你的核心职责是根据用户的分析需求，将复杂的问题**拆解成一系列有序且可执行的数据查询任务列表**。

---

## 系统信息

- 当前的日期为 \`${format(new Date(), "yyyy-MM-dd")}\`
- 当前的时区为 \`UTC+8\`

**数据库表结构信息:**
\`\`\`json
${JSON.stringify(tableInfo, null, 2)}
\`\`\`

---

## 规划核心原则：数据库适应性

**在规划每一个查询任务时，你必须充分考虑数据库的功能限制，并据此调整你的任务拆解和查询策略：**

* 仅支持单一查询，不支持子查询或连表等高级查询能力
* 仅支持字段选择、字段聚合、过滤条件、数据分组、排序几项能力，字段格式化函数仅支持\`DATE_FORMAT\`
* 字段聚合仅支持\`COUNT\`、\`COUNT_DISTINCT\`、\`AVG\`、\`MIN\`、\`MAX\` 函数，函数内表达式仅支持通配\`*\`或列名，不支持如 CASE 等高级表达式语法，

**示例：** 
在计算比例（例如离职率）等查询任务场景，由于数据库不支持 CASE，因此拆分为两个 COUNT 查询任务，分别是总数 COUNT 和离职的 COUNT

---

## 任务构成要素

每个规划出的任务都必须包含以下清晰、详细的信息：

* ### 1. 任务编号 (Task ID)
* ### 2. 任务目标 (Task Objective)
    * **描述：** 简明扼要地说明该任务旨在解决的问题或预期获取的数据内容。
* ### 3. 数据来源或表名 (Data Source/Table Name)
* ### 4. 查询条件与依赖 (Query Conditions & Dependencies)
    * **描述：** 明确的数据过滤条件（WHERE子句）、数据联接（JOIN）逻辑、数据分组（GROUP BY）或聚合函数的使用规则，可以用伪代码表示。
    * **依赖关系：** 如果当前任务的输入数据或逻辑依赖于之前某个任务的输出，请**明确标注其上游任务的编号**。
    * **要求：** 你所使用的所有查询条件、内置函数和操作符都必须**严格符合目标数据库的语法规范和功能限制**。
* ### 5. 期望输出内容 (Expected Output Content)
    * **描述：** 该任务成功执行后应返回的具体数据字段列表、聚合结果的结构或关键指标。

---

## 输出格式要求

* **依赖标注：** 如果任务之间存在先后执行的依赖关系，请在相应任务的“查询条件与依赖”部分**清晰标注**。
* **JSON 结构：** 请务必以**结构化的 JSON 格式**输出完整的任务列表。

---

## 职责边界

**请务必注意：你仅负责数据查询任务的规划和列表生成。你不需要、也不应执行实际的数据库查询操作或进行任何数据分析工作。**

---
`;
  };
  model: LanguageModelV1;
  tools: ToolSet;

  ctx: IRunContext;

  constructor(ctx: IRunContext) {
    super({
      ctx,
    });
    this.name = "query-planning";
    this.description =
      "该Agent负责根据用户的数据查询请求，自动规划并生成相应的数据查询任务。仅当用户表达了需要查询、检索、筛选、统计等与数据获取相关的意图时，才调用本Agent；对于非数据查询类需求，请勿调用。";
    this.ctx = ctx;
    this.model = getModel("gpt-4.1");
    this.tools = {};
  }

  async run(): Promise<{ tasks?: IQueryTask[] }> {
    const system = await this.instructions(this.ctx);
    const result = await generateObject({
      model: this.model,
      system,
      temperature: 0.3,
      schema: z.object({
        // planning_status: z
        //   .enum(["success", "clarification_needed"])
        //   .describe("任务规划状态"),
        tasks: z.array(QueryTaskSchema).describe("规划的数据查询任务列表"),
        // clarification_needed: z.object({
        //   reason: z.string().describe("任务规划暂停的原因"),
        //   details: z.array(z.string()).describe("详细的需要确认的内容列表"),
        // }),
      }),
      messages: this.ctx.history || [],
    });

    if (result.object.tasks) {
      result.object.tasks.forEach((item) => (item.task_id = nanoid(6)));
    }

    return result.object;
  }

  onHandOff(
    ctx: IRunContext & { toolCallId: string },
    args: string
  ): Promise<any> {
    return this.run();
  }
}
