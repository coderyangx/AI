import { sleep } from "../lib/index";
import { formFetch } from "../lib/request/form";
import { ToolCacheManager } from "../lib/cache/tool";
import { LocalQueryEngine } from "../lib/query/engine";
import { QueryDsl, QueryDslSchema } from "../lib/query/dsl";
import { getFormFields as _getFormFields } from "./form-fields";

const cacheManager = new ToolCacheManager({
  ttl: 1000 * 60 * 60,
});

const getFormRecordsOfPage = async (
  ctx: any,
  page: number,
  pageSize: number
) => {
  const result = await formFetch(ctx).post<{
    page: { pageNo: number; totalCount: number };
    pageList: { id: string; fields: Record<string, any> }[];
  }>("/api/zeroconsole/view/data/list", {
    pageNo: page,
    pageSize,
    viewCode: ctx.view,
  });

  return result;
};

const getFormFields = async (ctx: any) => {
  const cacheKey = {
    view: ctx.view,
  };

  const cache = cacheManager.get(cacheKey);
  let results;
  if (typeof cache !== "undefined") {
    results = cache;
  } else {
    results = await _getFormFields(ctx);
  }

  return results;
};

const getFormRecords = async (ctx: any, maxRecords = 10000) => {
  const cacheKey = {
    view: ctx.view,
    maxRecords,
  };

  const cache = cacheManager.get(cacheKey);
  let results;
  if (typeof cache !== "undefined") {
    results = cache;
  } else {
    const pageSize = 100;
    const firstPageResult = await getFormRecordsOfPage(ctx, 1, pageSize);
    const maxPages = Math.ceil(
      Math.min(maxRecords, firstPageResult.page.totalCount) / pageSize
    );

    if (firstPageResult.page.totalCount > maxRecords) {
      throw new Error(
        `记录总数已超过${maxRecords}, 建议新建视图缩小数据范围再进行分析`
      );
    }

    results = [...firstPageResult.pageList];
    for (let i = 2; i < maxPages; i++) {
      const result = await getFormRecordsOfPage(ctx, i, pageSize);
      results.push(...result.pageList);
      await sleep(10);
    }

    cacheManager.set(cacheKey, results);
  }

  const data = results.map((item) => ({
    id: item.id,
    ...item.fields,
  }));

  const { columns } = await getFormFields(ctx);

  const queryEngine = new LocalQueryEngine(data, columns);

  const queryResult = await queryEngine.query(ctx.dsl);

  return queryResult;
};

export const getFormRecordsToolFactory = (ctx: any) => {
  return {
    id: "get-table-records",
    description: `根据 DSL 进行数据查询，支持查询数据记录以及对数据进行聚合如计数。关于 DSL 的设计请参考如下要求:

**请务必严格遵守 Zod Schema 中定义的每个字段的类型、结构、必选性以及\`.describe()\` 方法中提供的详细描述。理解并运用这些描述是生成高质量 DSL 的关键。**

**核心生成规则和优先级：**

1.  **严格遵循结构**: 您的输出必须是单一的 JSON 对象。不要生成任何额外的文字、解释或代码块外部的内容。
2.  **聚合 (Aggregations) 优先级最高**:
    * **当用户需求明确涉及统计、计数、求和、平均值、最大/最小值等聚合操作（例如“统计数量”、“计算总和”、“每个分类的平均值”）时，这应是您的最高优先级。**
    * 在这种情况下，请**优先使用 \`aggregations\` 字段**来定义聚合函数。
    * 对于 \`COUNT(*)\` 的情况，\`field\` 必须是字符串 \`"*" \`。
    * 如果用户为聚合结果指定了别名，请使用 \`alias\` 字段。
4.  **\`select\` 字段与聚合的关系**:
    * **全局聚合（无分组）**: 如果用户只要求进行不分组的全局统计（例如“统计总用户数”、“计算所有产品的总价格”），则 \`select\` 字段**应完全省略**。这意味着只会在 \`SELECT\` 子句中包含聚合函数，例如 \`SELECT COUNT(*) FROM ...\`。
    * **分组聚合**: 如果用户请求了聚合，并且同时指定了 \`GROUP BY\` 字段（例如“按分类统计产品数量”），则 \`select\` 字段**通常应只包含用于 \`groupBy\` 的字段**。
    * **无聚合需求**: 如果查询不涉及任何聚合操作，并且用户明确要求“所有字段”或未指定任何特定字段，**请省略 \`select\` 字段**（让下游解析器默认处理 \`*\`）。
    * **无聚合需求且指定字段**: 如果查询不涉及聚合，并且用户指定了特定字段（含别名），请使用 \`{ "原始字段名": "别名" }\` 格式填充 \`select\` 字段。
5.  **\`where\` 字段**:
    * **优先级**: 优先识别用户请求中的逻辑连接词（如“并且”、“或者”、“不包括”）来构建 \`AND\` / \`OR\` / \`NOT\` 复合条件。
    * **默认操作符**: 如果用户未明确指定操作符，请默认为 \`=\`。
    * **\`IN\` / \`NOT IN\`**: \`value\` 必须是 JSON 数组。
    * **\`IS NULL\` / \`IS NOT NULL\`**: \`operator\` 必须设置为 \`'IS NULL'\` 或 \`'IS NOT NULL'\`，**且不要包含 \`value\` 字段**。
6.  **\`groupBy\` 字段**: 如果用户请求按某个或某些字段进行分组，请使用此字段。它通常与 \`aggregations\` 字段一起出现。
7.  **\`distinct\` 字段**: 仅当用户明确要求去重时才设置为 \`true\`。
8.  **省略可选字段**: 如果某个可选字段没有对应用户需求，**请完全省略该字段**，而不是将其设置为空数组或空对象。    
`,
    parameters: QueryDslSchema,
    async execute(dsl: QueryDsl, { toolCallId }) {
      console.log("columns", JSON.stringify(dsl, null, 2));
      try {
        ctx.stream?.appendMessageAnnotation({
          type: "tool-status",
          toolCallId,
          status: "in-progress",
        });
        const result = await getFormRecords({
          ...ctx,
          dsl,
        });
        return {
          content: [
            {
              type: "text",
              text: `Query results:
---
${JSON.stringify(result)}
---
`,
            },
          ],
        };
      } catch (e) {
        console.log(e);
        return {
          content: {
            type: "text",
            text: "Failed to get table records",
          },
          isError: true,
        };
      }
    },
  };
};
