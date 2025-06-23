import { QueryDsl } from "./dsl";
import { formatDataRow } from "./formatter";
import { parseDsl } from "./parser";
import alasql from "alasql";

export class LocalQueryEngine {
  private _data: Record<string, any>[];
  private _columns: { column_name: string; data_type: string }[];

  /**
   *
   * @param data 字段键值对，示例如下
   * {
   *  "id": "7b5add42ea6044978630fc74d64592d7",
   *  "number_56eb8e08": 10
   * }
   */
  constructor(
    data: Record<string, any>[],
    columns: { column_name: string; data_type: string }[]
  ) {
    this._data = data.map(formatDataRow);
    this._columns = columns;
  }

  async query(dsl: QueryDsl) {
    const sql = parseDsl(dsl, this._columns);
    console.log(`sql -> ${sql}`);
    const result = await alasql(sql, [this._data]);

    // console.log(`data -> ${JSON.stringify(this._data)}`);
    // console.log(`result -> ${JSON.stringify(result)}`);

    return result;
  }
}
