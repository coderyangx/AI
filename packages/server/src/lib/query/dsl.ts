import { z } from "zod";

// JsonSelectField: 定义选择字段的类型
const JsonSelectFieldSchema = z
  .union([
    z.string().describe('字段名，例如 "id"'),
    z
      .record(z.string(), z.string())
      .describe(
        '带别名的字段，键是原始字段名，值是别名，例如 { "user_name": "name" }'
      ),
  ])
  .describe("表示要选择的单个字段，可以是字符串或带别名的对象。");

// ComparisonOperator: 定义 SQL 比较操作符
const ComparisonOperatorSchema = z.enum([
  "=",
  "!=",
  ">",
  "<",
  ">=",
  "<=",
  "LIKE",
  "NOT LIKE",
  "IN",
  "NOT IN",
  "IS NULL",
  "IS NOT NULL",
]).describe(`SQL 比较操作符。一些特殊限制如下:
1. 对于\`TIMESTAMP\`类型的数据列，仅支持\`>\` ,\`>=\`,\`<\`,\`<=\`比较操作符
2. 仅对\`TEXT\`类型的数据列使用\`LIKE\`,\`NOT LIKE\`比较操作符
`);

// JsonSimpleFilter: 定义一个简单的过滤条件
const JsonSimpleFilterSchema = z
  .object({
    field: z.string().regex(/^[a-zA-Z0-9_]+$/, '筛选字段仅支持字母、数字、下划线的组合，请使用表格的 column_name 作为筛选条件').describe("必需。过滤的字段名。"),
    operator: ComparisonOperatorSchema.describe(
      '比较操作符'
    ),
    value: z
      .union([
        z.string(),
        z.number(),
        z.boolean(),
        z.null(),
        z.array(z.union([z.string(), z.number(), z.boolean(), z.null()])), // 用于 IN/NOT IN
      ])
      .optional()
      .describe(
        "可选。过滤的值。可以是字符串、数字、布尔、null 或数组 (用于 IN/NOT IN)。对于 IS NULL/IS NOT NULL 操作符，此字段不应存在。"
      ),
  })
  .describe(
    '表示一个简单的字段过滤条件，例如 { "field": "price", "operator": ">", "value": 100 }。'
  );

// JsonCompoundFilter: 定义一个复合过滤条件（AND/OR/NOT）
const JsonCompoundFilterSchema: z.ZodSchema<any> = z
  .object({
    AND: z
      .lazy(() => z.array(JsonFilterConditionSchema))
      .optional()
      .describe("逻辑 AND 操作，包含一个条件数组。所有子条件必须为真。"),
    OR: z
      .lazy(() => z.array(JsonFilterConditionSchema))
      .optional()
      .describe("逻辑 OR 操作，包含一个条件数组。至少一个子条件必须为真。"),
    NOT: z
      .lazy(() => JsonFilterConditionSchema)
      .optional()
      .describe("逻辑 NOT 操作，包含一个单个条件。此子条件必须为假。"),
  })
  .describe("表示一个复合过滤条件，用于组合多个简单或复杂的条件。");

// JsonFilterCondition: 定义所有可能的过滤条件（联合类型）
const JsonFilterConditionSchema = z
  .union([JsonSimpleFilterSchema, JsonCompoundFilterSchema])
  .describe("表示一个过滤条件，可以是简单过滤或复合（AND/OR/NOT）过滤。");

// JsonAggregateFunction: 定义聚合函数
const JsonAggregateFunctionSchema = z
  .object({
    type: z
      .enum(["count", "sum", "avg", "max", "min"])
      .describe(
        "聚合函数类型。**这是用于统计记录数、总和等操作的优先级字段。**"
      ),
    field: z
      .string()
      .describe('要聚合的字段名。对于 COUNT(*) 的情况，请务必使用字符串 "*"。'),
    alias: z.string().optional().describe("可选。聚合结果的别名。"),
  })
  .describe(
    "定义一个聚合函数及其相关属性。**当用户请求统计（如“数量”、“总和”）时，应优先使用此字段。**"
  );

// --- 核心 DSL Schema ---

export const QueryDslSchema = z
  .object({
    select: z
      .array(JsonSelectFieldSchema)
      .optional()
      .describe(
        "可选。要从表中选择的字段列表。如果省略此字段或为空数组，则默认选择所有字段 (*)。"
      ),
    distinct: z
      .boolean()
      .optional()
      .describe(
        "可选。如果设置为 true，则在 SELECT 语句中添加 DISTINCT 关键字以返回唯一结果。"
      ),
    where: JsonFilterConditionSchema.optional().describe(
      "可选。用于过滤查询结果的条件。可以是简单条件或通过 AND/OR/NOT 组合的复杂条件。"
    ),
    groupBy: z
      .array(z.string())
      .optional()
      .describe(
        "可选。用于对查询结果进行分组的字段名数组。通常与聚合函数一起使用。"
      ),
    aggregations: z
      .array(JsonAggregateFunctionSchema)
      .optional()
      .describe(
        "可选。要应用于查询结果的聚合函数列表 (例如 COUNT, SUM, AVG)。"
      ),
  })
  .describe("一个用于生成数据库 SELECT 查询语句的 JSON DSL 结构。");

// --- 导出 Zod 类型，方便在 TypeScript 中使用 ---
export type QueryDsl = z.infer<typeof QueryDslSchema>;
export type JsonSelectField = z.infer<typeof JsonSelectFieldSchema>;
export type JsonFilterCondition = z.infer<typeof JsonFilterConditionSchema>;
export type JsonSimpleFilter = z.infer<typeof JsonSimpleFilterSchema>;
export type JsonCompoundFilter = z.infer<typeof JsonCompoundFilterSchema>;
export type JsonAggregateFunction = z.infer<typeof JsonAggregateFunctionSchema>;
export type ComparisonOperator = z.infer<typeof ComparisonOperatorSchema>;
