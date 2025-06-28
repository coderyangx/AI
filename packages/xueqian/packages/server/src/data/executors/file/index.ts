import { s3 } from "../../../lib/memory-s3/index.js";
import { LocalQueryEngine } from "../../../lib/query/engine.js";
import { executorRegistryManager } from "../../manager/executor.js";
import { IQueryExecutorFunction } from "../../types";
import XLSX from "xlsx";

const executor: IQueryExecutorFunction = async (dsl, ctx) => {
  const { tables } = await ctx.dataSvc?.getDataSchema();
  const table = tables.find((t) => t.name === dsl.from);

  console.log("selected table", JSON.stringify(table));
  if (!table) {
    throw new Error(`数据查询失败，表<${dsl.from}>不存在`);
  }

  const file = s3.getObject(ctx.presetOptions.fileKey);
  const content = file.data; // excel buffer

  // 解析Excel文件
  const workbook = XLSX.read(content, { type: "buffer" });

  // 获取指定的sheet
  const worksheet = workbook.Sheets[table.name];
  if (!worksheet) {
    throw new Error(`数据查询失败，工作表<${table.name}>不存在`);
  }

  // 将sheet转换为JSON，包含表头
  const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

  if (jsonData.length <= 1) {
    // 只有表头或空表
    return [];
  }

  // 获取表头（第一行）
  const headerRow = jsonData[0] as string[];

  // 转换数据行（不包括表头）
  const rows = [];
  for (let i = 1; i < jsonData.length; i++) {
    const row = jsonData[i] as any[];
    if (!row || row.length === 0) continue;

    const rowData: Record<string, any> = {};
    headerRow.forEach((header, index) => {
      rowData[`${header}${index + 1}`] = index < row.length ? row[index] : null;
    });

    rows.push(rowData);
  }

  // 使用LocalQueryEngine执行查询
  const queryEngine = new LocalQueryEngine(rows, table.columns);

  const queryResult = await queryEngine.query(dsl);

  return queryResult;
};

executorRegistryManager.registerExecutor("excel", executor);
