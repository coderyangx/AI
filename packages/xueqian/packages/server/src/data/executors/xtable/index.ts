import { LocalQueryEngine } from "../../../lib/query/engine.js";
import { executorRegistryManager } from "../../manager/executor.js";
import {
  getAllRows,
  getTableMeta,
  getTables,
} from "../../presets/xtable/request.js";
import { IQueryExecutorFunction } from "../../types";
import { formatters } from "./formatter.js";

const executor: IQueryExecutorFunction = async (dsl, ctx) => {
  const { tables } = await ctx.dataSvc?.getDataSchema();
  const rawTables = await getTables(ctx.view);
  const table = tables.find((item) => item.name === dsl.from);
  const rawTable = rawTables.find((item) => item.title === dsl.from);
  const tableMeta = await getTableMeta(rawTable.tableId);

  console.log("selected table", JSON.stringify(table));
  if (!table) {
    throw new Error(`数据查询失败，表<${dsl.from}>不存在`);
  }

  const rows = await getAllRows(rawTable.tableId);

  console.log(`get rows from <${rawTable.tableId}>, count <${rows.length}>`);

  // (JSON.parse(col.config).options
  const formatDataRow = (item: Record<string, any>) => {
    for (const key in item) {
      const column = tableMeta.columns.find((col) => col.name === key);
      const formatter = formatters.find(
        (f) => f.columnType === column.columnType
      );
      if (formatter && formatter?.format) {
        item[key] = formatter.format(item[key], column.config);
      }
    }
    return item;
  };

  const queryEngine = new LocalQueryEngine(
    rows.map(formatDataRow),
    table.columns
  );

  const queryResult = await queryEngine.query(dsl);

  return queryResult;
};

executorRegistryManager.registerExecutor("xtable", executor);
