import { executorRegistryManager } from "../../manager/executor.js";
import { IQueryExecutorFunction } from "../../types";
import { sleep } from "../../../lib/index.js";
import { formFetch } from "../../../lib/request/form.js";
import { ToolCacheManager } from "../../../lib/cache/tool.js";
import { LocalQueryEngine } from "../../../lib/query/engine.js";
import { IRunContext } from "../../../types/context.js";
import { QUERY_CONFIG } from "../../../lib/query/dsl-schema.js";
import { formatDataRow } from "./formatter.js";

const cacheManager = new ToolCacheManager({
  ttl: 1000 * 60 * 60,
});

export const getFormRecordsOfPage = async (
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

const getFormRecords = async (
  dsl: QUERY_CONFIG["dsl_query"],
  ctx: IRunContext
) => {
  const maxRecords = 100000; // temp
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
    for (let i = 2; i <= maxPages; i++) {
      const result = await getFormRecordsOfPage(ctx, i, pageSize);
      results.push(...result.pageList);
      await sleep(10);
    }

    cacheManager.set(cacheKey, results);
  }

  const data = results.map((item) => ({
    id: item.id,
    ...item.fields,
    SYSTEM_CREATOR: item.submitter,
    SYSTEM_DATE_CREATED: item.submitTime,
  }));

  const { tables } = await ctx.dataSvc?.getDataSchema();
  const table = tables.find((item) => item.name === dsl.from);

  const queryEngine = new LocalQueryEngine(
    data.map(formatDataRow),
    table.columns
  );

  const queryResult = await queryEngine.query(dsl);

  return queryResult;
};

const executor: IQueryExecutorFunction = async (dsl, ctx) => {
  const result = await getFormRecords(dsl, ctx);
  return result;
};

executorRegistryManager.registerExecutor("kuaida", executor);
