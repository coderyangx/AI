import { s3 } from "../../../lib/memory-s3/index.js";
import { IRunContext } from "../../../types/context";
import {
  IDataAnalysisPreset,
  IDatabaseSchema,
  ITableSchema,
  IColumnSchema,
} from "../../types";
import XLSX from "xlsx";

const getDataSchema = async (ctx: IRunContext): Promise<IDatabaseSchema> => {
  const file = s3.getObject(ctx.presetOptions.fileKey);
  const content = file.data; // excel file buffer

  // 解析Excel文件
  const workbook = XLSX.read(content, { type: "buffer" });
  const tables: ITableSchema[] = [];

  // 遍历每个sheet
  workbook.SheetNames.forEach((sheetName) => {
    const worksheet = workbook.Sheets[sheetName];

    // 将sheet转换为JSON
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    if (jsonData.length === 0) {
      return; // 跳过空sheet
    }

    // 第一行作为列名
    const headerRow = jsonData[0] as string[];

    // 创建列定义
    const columns: IColumnSchema[] = headerRow.map((header, i) => ({
      name: `${header}${i + 1}`,
      // 简单类型推断，可以根据实际需求扩展
      type: "string",
      description: `${header}${i + 1}列`,
      role: "dimension", // 默认为维度
    }));

    // 转换数据行
    const rows = [];
    for (let i = 1; i < jsonData.length; i++) {
      const row = jsonData[i] as any[];
      if (!row || row.length === 0) continue;

      const rowData: Record<string, any> = {};
      headerRow.forEach((header, index) => {
        rowData[`${header}${index + 1}`] =
          index < row.length ? row[index] : null;
      });

      rows.push(rowData);
    }

    tables.push({
      name: sheetName,
      description: `${sheetName}表`,
      columns,
      data_samples: rows.slice(0, 5), // 取前5行作为样本数据
    });
  });

  return {
    tables,
  };
};

export const filePreset: IDataAnalysisPreset = {
  id: "excel",
  description: "Excel/CSV文件数据分析",
  prompt: "", // TODO support
  database_schema: getDataSchema,
  query_executor: "excel",
};
