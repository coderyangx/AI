import { generateObject } from "ai";
import { getModel } from "../../lib/ai/model-provider.js";
import { QUERY_SCHEMA } from "../../lib/query/dsl-schema.js";
import type { IToolFactory } from "../../types/tool.js";
import { z } from "zod";
import { format } from "date-fns";
import { IRunContext } from "../../types/context.js";

const parametersSchema = z.object({
  task_id: z.string().describe("当前洞察任务的唯一标识符"),
  overall_objective: z.string().describe("当前洞察任务的整体目标描述"),
  current_query_goal: z.string().describe("当前需要执行的具体查询目标"),
  required_tables: z
    .array(z.string())
    .describe("当前洞察任务所有相关的数据库表列表"),
  relevant_columns: z
    .array(z.string())
    .describe("当前洞察任务所有相关的数据库列列表"),
  overall_constraints_or_filters: z
    .string()
    .describe("适用于整个洞察任务的宏观约束与过滤条件"),
});

const dslDesign = async (
  args: z.infer<typeof parametersSchema>,
  ctx: IRunContext
) => {
  const tableInfo = await ctx.dataSvc?.getDataSchema();
  const system = `你是一个高度专业的数据库查询语言（DSL）设计专家。你的任务是将自然语言的查询目标精确地转换为约定的查询 DSL。你必须严格遵守以下指令和提供的上下文信息。

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

**数据库能力局限性**

- 不支持复杂子查询或多层嵌套查询
- 不支持跨库 JOIN

## 3. 约定 DSL 规范：

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

## 4. 输出格式要求

- 请严格输出如下 JSON 格式，字段顺序、类型、结构不得变更。未用字段用 null 或空数组表示。
- 如果由于数据库局限性或 Schema 不匹配导致无法生成有效的 DSL，请输出一个明确的错误信息，说明原因。

\`\`\`json
{
  "dsl": {
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
  "error": "无法生成 dsl 时提供的错误原因"
}
\`\`\`

**特殊限制**

- 对于\`TIMESTAMP\`类型的字段，WHERE 筛选条件要使用\`like\`等文本比较操作符时请使用\`DATE_FORMAT\`函数先格式化字段

---

## 5. 示例

**用户查询:** "查找价格高于100元的电子产品有多少个？"
\`\`\`json
{
  "dsl": {
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
  "error": null

}
\`\`\`

**用户查询:** "给我看看所有订单的顾客ID和总金额，并且按照订单日期降序排列。"
\`\`\`json
{
  "dsl": {
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
  "error": null

}
\`\`\`

**用户查询:** "我想知道所有商品的名字和库存量，并且库存量要大于0。"
\`\`\`json
{
  "dsl": {
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
  "error": null
}
\`\`\`

**用户查询:** "产品有哪些分类？"
\`\`\`json
{
  "dsl": {
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
  "error": null
}
\`\`\`

**用户查询:** "各分类的产品数量？"
\`\`\`json
{
  "dsl": {
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
  "error": null
}
\`\`\`

**用户查询:** "我不明白"
\`\`\`json
{
  "dsl": {
    "from": null,
    "select": [],
    "where": [],
    "groupBy": [],
    "orderBy": [],
    "limit": null
  },
  "error": "抱歉，我未能理解您的查询意图。请您提供更具体或清晰的请求，例如：'查找所有商品名称' 或 '统计电子产品数量'。"
}
\`\`\`

---

**请严格按照上述流程与格式进行输出。** 若遇到无法确定的情况，优先保证 JSON 结构正确、字段齐全、类型准确。

---
`;

  const prompt = `请基于下面的任务信息执行查询 DSL 设计：

---
1. **整体洞察任务目标**：${args.overall_objective}

2. **当前查询目标**：${args.current_query_goal}
   * 你必须将这个目标精确地转换为 DSL。

3. **当前洞察任务相关数据库表**: ${JSON.stringify(args.required_tables)}
    * 你的查询 DSL 必须仅使用这些表中包含的数据。

4.  **当前洞察任务相关数据库列**: ${JSON.stringify(args.relevant_columns)}
    * 你的查询 DSL 必须优先使用这些列。如果你认为为了达成目标需要使用不在列表中的列，请确保该列存在于“完整的数据库表结构信息”中且是必需的。

5.  **整体任务约束与过滤条件**: ${JSON.stringify(
    args.overall_constraints_or_filters
  )}
---
`;

  const { object } = await generateObject({
    model: getModel("gpt-4.1"),
    system,
    schema: z.object({
      dsl: QUERY_SCHEMA,
      error: z
        .string()
        .nullable()
        .describe("如果无法生成有效的 DSL，请输出一个明确的错误信息"),
    }),
    temperature: 0.3,
    prompt,
  });

  return object;
};

export const designAndQueryDataToolFactory: IToolFactory = (ctx) => {
  return {
    name: "design-and-query-data",
    description: `解析数据洞察任务下的单个具体的数据查询目标，内部生成数据查询 DSL 并执行数据查询，返回数据查询结果`,
    parameters: parametersSchema,
    async execute(args: z.infer<typeof parametersSchema>, options) {
      console.log("query", JSON.stringify(args, null, 2));
      try {
        const ret = await dslDesign(args, ctx);
        if (ret.error) {
          throw new Error(ret.error);
        }
        const result = await ctx.dataSvc?.executeQuery(ret.dsl);
        return {
          dsl: ret.dsl,
          result,
        };
      } catch (e) {
        console.log(e);
        return {
          content: [
            {
              type: "text",
              text: `Failed to get table records.
:::hidden
Debug 信息:

Error -> ${e.message}
:::
`,
            },
          ],
          isError: true,
        };
      }
    },
  };
};
