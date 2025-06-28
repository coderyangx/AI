import { IRunContext } from "../../../types/context";
import { IDataAnalysisPreset, IDatabaseSchema } from "../../types";
import { getTableMeta, getTables } from "./request.js";

const COLUMN_TYPE_MAP: {
  columnType: number;
  type: string;
  role: "dimension" | "metric";
}[] = [
  {
    // 多行文本/AI 列
    columnType: 1, // 字符串(type='text'|'link')，// TODO 转 markdown
    type: "VARCHAR",
    role: "dimension",
  },
  {
    // 数字
    columnType: 2,
    type: "INTEGER",
    role: "metric",
  },
  {
    // 单选
    columnType: 3,
    type: "ENUM",
    role: "dimension",
  },
  {
    columnType: 4, // people
    type: "VARCHAR", // "config": "{\"multiple\":true}",
    role: "dimension",
  },
  {
    // 多选
    columnType: 5,
    type: "ENUM",
    role: "dimension",
  },
  {
    // 附件
    columnType: 6,
    type: "VARCHAR",
    role: "dimension",
  },
  {
    // 日期
    columnType: 7,
    type: "TIMESTAMP",
    role: "dimension",
  },
  {
    // 货币
    columnType: 8,
    type: "DECIMAL",
    role: "metric",
  },
  {
    // 公式
    columnType: 9,
    type: "VARCHAR",
    role: "dimension",
  },
];

// ---

const getDataSchema = async (ctx: IRunContext): Promise<IDatabaseSchema> => {
  const tables = await getTables(ctx.view);

  const infoTasks: Promise<any>[] = [];
  for (const table of tables) {
    const task = getTableMeta(table.tableId).then((result) => ({
      columns: result.columns,
      version: result.version,
      table,
    }));
    infoTasks.push(task);
  }
  const results = await Promise.all(infoTasks);
  const info = {
    tables: results.map((item) => {
      return {
        name: item.table.title,
        description: "",
        columns: item.columns
          .filter((col) => col.id < 100)
          .map((col) => {
            // 100及以上 ID 的 column 是系统列，暂时不用
            const mapValue = COLUMN_TYPE_MAP.find(
              (c) => c.columnType === col.columnType
            );
            const info: Record<string, any> = {
              name: col.name,
              description: col.description || "",
              type: mapValue?.type || item.rawType,
              role: mapValue?.role || "dimension",
            };

            if (col.columnType === 3 && col.config) {
              info.enum_values = (JSON.parse(col.config).options || []).map(
                (item) => item.label
              );
            }

            return info;
          }),
      };
    }),
  };

  return info;
};

// ---

export const xtablePreset: IDataAnalysisPreset = {
  id: "xtable",
  description: "多维表格数据",
  prompt: "", // TODO support
  database_schema: getDataSchema,
  query_executor: "xtable",
};
