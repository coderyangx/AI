import { z } from "zod";

// 聚合函数
const ALLOWED_AGG_FUNCTIONS = z.enum([
  "SUM",
  "AVG",
  "COUNT",
  "COUNT_DISTINCT",
  "MAX",
  "MIN",
]);

// selects
const SELECT_FIELD_SCHEMA = z
  .object({
    column: z.string().describe("表字段"),
    aggr: ALLOWED_AGG_FUNCTIONS.describe(
      "对字段使用聚合函数，其中 SUM,AVG,MAX,MIN 聚合函数仅支持指标字段"
    ).optional(),
    alias: z.string().optional().describe("字段别名"),
  })
  .describe("选择维度字段或者聚合字段");

// where
export const CONDITION_SCHEMA = z.object({
  column: z.string().describe("表字段"),
  operator: z
    .enum(["eq", "ne", "gt", "lt", "gte", "lte", "in", "like"])
    .describe("字段比较操作符"),
  value: z
    .union([z.string(), z.number(), z.array(z.string())])
    .describe("筛选条件的右值"),
});

// sort
const SORT_SCHEMA = z.object({
  column: z.string(),
  direction: z.enum(["ASC", "DESC"]),
});

// query
export const QUERY_SCHEMA = z.object({
  from: z.string().describe("数据来源表名"),
  select: z
    .array(SELECT_FIELD_SCHEMA)
    .min(1, "至少包含一个 Select")
    .describe("结果选取"),
  where: z.array(CONDITION_SCHEMA).describe("数据筛选条件"),
  groupBy: z.array(z.string()).optional().describe("数据记录分组配置"),
  orderBy: z.array(SORT_SCHEMA).optional().describe("数据记录排序配置"),
  limit: z.union([
    z.number().int().positive().optional().describe("返回记录的条数限制"),
    z.null(),
  ]),
});

/* ------------------------------ */
export const QUERY_CONFIG_SCHEMA = z.object({
  // DSL 查询详情
  dsl_query: QUERY_SCHEMA,

  // 描述
  hint: z.string().describe("该 DSL Query 将执行的逻辑的含义分析"),
});

export type QUERY_CONFIG = z.infer<typeof QUERY_CONFIG_SCHEMA>;

// DSL 的一些额外校验，多数是字段之间约束相关
export const validateQuery = (query: z.infer<typeof QUERY_SCHEMA>) => {
  const { select, groupBy = [], where = [], orderBy = [] } = query;

  const errors: string[] = [];

  for (const selectItem of select) {
    if (
      !/^[a-z0-9_]+/i.test(selectItem.column) &&
      !/^(DATE_FORMAT)/i.test(selectItem.column)
    ) {
      errors.push(`不合法的 Select 字段，仅能使用 DATE_FORMAT 函数`);
    }
  }

  // groupBy 字段必须出现在 select 中（如果 select 是字符串或聚合字段的 metric）
  if (groupBy.length > 0) {
    const selectDimensions = select
      .filter((item) => !(item as any).aggr)
      .map((item) => item.column);
    for (const groupCol of groupBy) {
      if (!selectDimensions.includes(groupCol)) {
        errors.push(`groupBy 字段 ${groupCol} 必须出现在 select 维度字段中`);
      }
    }
  }

  // 聚合字段和 groupBy 的约束
  // 只有 select 中有聚合字段时才允许 groupBy，不允许 select 只有维度字段且 groupBy 不为空
  // const hasAgg = select.some((item) => !!(item as any).aggr);
  // if (!hasAgg && groupBy.length > 0) {
  //   errors.push("没有聚合字段时不需要 groupBy");
  // }

  // 收集所有可用的排序字段名（column 和 alias）
  const selectFieldNames = new Set<string>();
  for (const item of select) {
    selectFieldNames.add(item.column);
    if (item.alias) {
      selectFieldNames.add(item.alias);
    }
  }

  // orderBy 的字段必须出现在 select 中
  if (orderBy.length > 0) {
    for (const order of orderBy) {
      if (!selectFieldNames.has(order.column)) {
        errors.push(`orderBy 字段 ${order.column} 必须出现在 select 中`);
      }
    }
  }

  // where 字段的 column 必须出现在 select、groupBy 或聚合字段 metric 中
  const allValidColumns = new Set([
    ...select.map((item) => item.column),
    ...groupBy,
  ]);
  for (const cond of where) {
    if (!allValidColumns.has(cond.column)) {
      errors.push(
        `where 字段 ${cond.column} 必须出现在 select、groupBy 或聚合字段 中`
      );
    }
  }

  return errors;
};
