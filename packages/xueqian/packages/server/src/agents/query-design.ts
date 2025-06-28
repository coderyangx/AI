import {
  type LanguageModelV1,
  type ToolSet,
  type ToolChoice,
  generateObject,
} from "ai";
import type { IAgent } from "../types/agent.js";
import type { IRunContext } from "../types/context.js";
import { QUERY_CONFIG_SCHEMA } from "../lib/query/dsl-schema.js";
import { getModel } from "../lib/ai/model-provider.js";
import { format } from "date-fns";
import { nanoid } from "nanoid";
import { BaseAgent } from "./base.js";
import { QueryTaskSchema } from "../types/query.js";
import { DSLTranslator } from "../lib/query/dsl-to-sql.js";

export class QueryDesignAgent extends BaseAgent implements IAgent {
  name: string;
  description: string;
  instructions: (ctx: IRunContext) => Promise<string> = async (ctx) => {
    const tableInfo = await ctx.dataSvc?.getDataSchema();

    return `你是一名**专业的 SQL 查询助手**，精通 SQL 数据库结构、查询逻辑和性能优化。

你的主要任务是：**将用户的自然语言查询请求，精准转化为 JSON 格式的查询 DSL**。该 DSL 可直接映射为 SQL 查询。

---

## 1. 工作要求

- **主动判断并合理使用数据去重逻辑**（如 \`COUNT_DISTINCT\`、\`GROUP BY\`），确保结果唯一性和准确性。
- **合理选择聚合函数**（如 \`COUNT()\`、\`COUNT_DISTINCT()\`、\`SUM()\`、\`AVG()\`、\`MAX()\`、\`MIN()\`），满足统计与汇总需求。
- **精确选择所需字段**，避免冗余数据。
- **优先考虑查询性能**，选择高效的查询方式。
- **严格遵循 SQL 标准与最佳实践**，例如：
  - \`GROUP BY\` 字段需出现在 \`SELECT\` 或聚合中。
  - \`WHERE\` 字段必须出现在 \`SELECT\`、\`GROUP BY\` 或聚合字段中
- **输出 JSON 时，字段顺序、数据类型、格式严格遵循定义**。

---

## 2. 系统信息

- 当前的日期为 \`${format(new Date(), "yyyy-MM-dd")}\`
- 当前的时区为 \`UTC+8\`

**数据库表结构信息:**
\`\`\`json
${JSON.stringify(tableInfo, null, 2)}
\`\`\`

**数据库支持的扩展函数:**

- DATE_FORMAT: 格式化时间戳为指定格式，格式兼容MySQL风格或使用\`yyyy-MM-dd\`、\`yyyy-MM\`、\`yyyy\`，示例如 DATE_FORMAT(\`date_field1\`, 'yyyy-MM-dd')

---

## 3. DSL 格式规范（dsl_query）：

- **from** (\`STRING | null\`)：目标表名。
- **select** (\`ARRAY\`)：需返回的列。每个元素结构为：
    - \`column\` (\`STRING\`)
    - \`alias\` (\`STRING，可选\`)
    - \`aggr\` (\`STRING，可选\`)
- **where** (\`ARRAY\`)：筛选条件。每个元素结构为：
    - \`column\` (\`STRING\`)
    - \`operator\` (\`STRING\`)
    - \`value\` (\`STRING | NUMBER | BOOLEAN\`)
- **groupBy** (\`ARRAY\`)：分组字段。
- **orderBy** (\`ARRAY\`)：排序方式。每个元素结构为：
    - \`column\` (\`STRING\`)
    - \`direction\` (\`"ASC"\` | \`"DESC"\`)
- **limit** (\`NUMBER | null\`)：返回记录数上限。

---

## 4. 结果描述（hint）

用简明的自然语言，描述 DSL 查询的核心逻辑、目的及可能风险。

## 5. 输出格式要求

**请严格输出如下 JSON 格式，字段顺序、类型、结构不得变更。未用字段用 null 或空数组表示。**

\`\`\`json
{
  "dsl_query": {
    "from": "表名",
    "select": [
      {"column": "列名", "alias": "别名", "aggr": "聚合函数名（可选）"}
    ],
    "where": [
      {"column": "列名", "operator": "操作符", "value": "值"},
    ],
    "groupBy": ["列名1", ...],
    "orderBy": [
      {"column": "列名", "direction": "ASC/DESC"}
    ],
    "limit": "数量"
  },
  "hint": "自然语言描述"
}
\`\`\`

**特殊限制**

- 对于\`TIMESTAMP\`类型的字段，WHERE 筛选条件要使用\`like\`等文本比较操作符时请使用\`DATE_FORMAT\`函数先格式化字段

---

## 6. 示例

**用户查询:** "查找价格高于100元的电子产品有多少个？"
\`\`\`json
{
  "dsl_query": {
    "from": "products",
    "select": [
      {"column": "product_id", "aggr": "COUNT", "alias": "product_count"}
    ],
    "where": [
      {"column": "price", "operator": "gt", "value": 100},
      {"column": "category", "operator": "eq", "value": "Electronics"}
    ],
    "groupBy": [],
    "orderBy": [],
    "limit": null
  },
  "hint": "此查询将统计'products'表中的商品数量，使用了价格高于100元且类别为'Electronics'两个要求同时满足的筛选条件，并使用了计数聚合"

}
\`\`\`

**用户查询:** "给我看看所有订单的顾客ID和总金额，并且按照订单日期降序排列。"
\`\`\`json
{
  "dsl_query": {
    "from": "orders",
    "select": [
      {"column": "customer_id"},
      {"column": "total_amount"}
    ],
    "where": [],
    "groupBy": [],
    "orderBy": [
      {"column": "order_date", "direction": "DESC"}
    ],
    "limit": null
  },
  "hint": "此查询将从'orders'表中获取所有订单的顾客ID和总金额，并按订单日期从最新到最旧排序。"

}
\`\`\`

**用户查询:** "我想知道所有商品的名字和库存量，并且库存量要大于0。"
\`\`\`json
{
  "dsl_query": {
    "from": "products",
    "select": [
      {"column": "product_name"},
      {"column": "stock_quantity"}
    ],
    "where": [
      {"column": "stock_quantity", "operator": "gt", "value": 0}
    ],
    "groupBy": [],
    "orderBy": [],
    "limit": null
  },
  "hint": "此查询将从'products'表中筛选出库存量大于0的商品，并显示其名称和库存量。"
}
\`\`\`

**用户查询:** "产品有哪些分类？"
\`\`\`json
{
  "intent": "query_data",
  "dsl_query": {
    "query_type": "SELECT",
    "from": "products",
    "select": [
      {"column": "category"}
    ],
    "where": [],
    "groupBy": ["category"],
    "orderBy": [],
    "limit": null
  },
  "hint": "此查询将查询'products'表中的商品分类列表，通过 group by 来去重记录"

}
\`\`\`

**用户查询:** "各分类的产品数量？"
\`\`\`json
{
  "dsl_query": {
    "from": "products",
    "select": [
      {"column": "category"},
      {"column": "*", aggr: "COUNT", "alias": "product_count"},
    ],
    "where": [],
    "groupBy": [
      "category"
    ],
    "orderBy": [],
    "limit": null
  },
  "hint": "此查询将'products'表中的商品分类聚合，统计每个分类的产品数量"

}
\`\`\`

**用户查询:** "我不明白"
\`\`\`json
{
  "dsl_query": {
    "from": null,
    "select": [],
    "where": [],
    "groupBy": [],
    "orderBy": [],
    "limit": null
  },
  "hint": "抱歉，我未能理解您的查询意图。请您提供更具体或清晰的请求，例如：'查找所有商品名称' 或 '统计电子产品数量'。"
}
\`\`\`

---

**请严格按照上述流程与格式进行输出。** 若遇到无法确定的情况，优先保证 JSON 结构正确、字段齐全、类型准确。

---
`;
  };
  model: LanguageModelV1;
  tools: ToolSet;

  ctx: IRunContext;

  constructor(ctx: IRunContext) {
    super({ ctx, inputSchema: QueryTaskSchema });
    this.name = "query-design";
    this.description =
      "接收 handoff.query-planning 工具规划的单个任务，分析数据查询需求并生成数据查询 DSL，返回存储 ID。当需要执行查询时，可以使用该 ID。";
    this.ctx = ctx;
    this.model = getModel("gpt-4.1");

    this.tools = {};
  }

  async run(options?: {
    maxSteps?: number;
    toolChoice?: ToolChoice<ToolSet>;
    input?: string;
  }): Promise<{
    query_id: string;
    hint: string;
    query?: any;
    sql?: string;
    goal?: string;
  }> {
    const system = await this.instructions(this.ctx);
    const result1 = await generateObject({
      model: this.model,
      system,
      schema: QUERY_CONFIG_SCHEMA,
      temperature: 0.3,
      messages: options?.input
        ? [
            {
              role: "user",
              content: `下面的任务描述包含了数据查询目标、表格名、建议的筛选条件和字段选择：\n\n---\n\n${options.input}\n\n---\n\n请基于它执行查询 DSL 设计`,
            },
          ]
        : this.ctx.history || [],
    });

    const queryId = nanoid(10);
    this.ctx.memory?.set(queryId, result1.object);

    const sql = new DSLTranslator(result1.object.dsl_query, []).toSQL();

    let goal = "";
    try {
      goal = JSON.parse(options?.input || "{}").goal;
    } catch {
      // ignore
    }

    return {
      query_id: queryId,
      goal,
      hint: result1.object.hint,
      query: result1.object, // for debug
      sql, // for debug
    };
  }

  async onHandOff(
    ctx: IRunContext & { toolCallId: string },
    args: string
  ): Promise<any> {
    return this.run({ input: `当前查询任务：${args}` });
  }
}
