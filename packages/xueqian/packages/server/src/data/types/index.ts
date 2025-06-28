import { QUERY_CONFIG } from "../../lib/query/dsl-schema";
import { IRunContext } from "../../types/context";

export interface IDataAnalysisPreset {
  id: string;
  description?: string;
  // 额外的系统提示词
  prompt?: string;
  database_schema: (ctx: IRunContext) => Promise<IDatabaseSchema>;
  query_executor: string;
}

export interface IDatabaseSchema {
  tables: ITableSchema[];
}

export interface ITableSchema {
  // 数据表名称（ID）
  name: string;
  description: string;
  columns: IColumnSchema[];
  // 少量数据样本示例
  data_samples?: Record<string, any>[];
}

export interface IColumnSchema {
  // 列名称（ID）
  name: string;
  // 数据库定义的数据类型，如 INTEGER/VARCHAR
  type: string;
  description: string;
  // 声明列的角色
  role: "dimension" | "metric";
}

export type IQueryExecutorFunction = (
  dsl: QUERY_CONFIG["dsl_query"],
  ctx: IRunContext
) => Promise<any>;
