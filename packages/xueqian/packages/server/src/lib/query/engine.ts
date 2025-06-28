import type { QUERY_CONFIG } from "./dsl-schema.js";
import { DSLTranslator } from "./dsl-to-sql.js";
import alasql from "alasql";
import { format } from "date-fns";
import { IColumnSchema } from "../../data/types/index.js";

alasql.fn["DATE_FORMAT"] = (ts: number, fm: string) => {
  if (!ts || typeof ts !== "number") {
    return "NULL";
  }

  const formatMap = {
    "%Y": "yyyy", // Year, numeric, four digits
    "%y": "yy", // Year, numeric, two digits
    "%m": "MM", // Month, numeric (01-12)
    "%c": "M", // Month, numeric (1-12)
    "%M": "MMMM", // Month name (January..December)
    "%b": "MMM", // Abbreviated month name (Jan..Dec)
    "%d": "dd", // Day of the month, numeric (01-31)
    "%e": "d", // Day of the month, numeric (1-31)
    "%D": "do", // Day of the month with suffix (1st, 2nd...)
    "%a": "EEE", // Abbreviated weekday name (Sun..Sat)
    "%W": "EEEE", // Weekday name (Sunday..Saturday)
    "%w": "i", // Day of the week (0=Sunday, 6=Saturday)
    "%H": "HH", // Hour (00-23)
    "%k": "H", // Hour (0-23)
    "%h": "hh", // Hour (01-12)
    "%I": "hh", // Hour (01-12) - same as %h
    "%l": "h", // Hour (1-12)
    "%i": "mm", // Minutes (00-59)
    "%s": "ss", // Seconds (00-59)
    "%S": "ss", // Seconds (00-59) - same as %s
    "%p": "a", // AM or PM
    "%f": "SSS", // Microseconds (000000-999999) - date-fns uses milliseconds
    "%j": "DDD", // Day of year (001-366)
    "%%": "'%'", // A literal '%' character (escaped for date-fns)
  };

  if (formatMap[fm]) {
    fm = formatMap[fm];
  }

  for (const key in formatMap) {
    fm = fm.replace(key, formatMap[key]);
  }

  const date = new Date(ts);
  return format(date, fm);
};

export class LocalQueryEngine {
  private _data: Record<string, any>[];
  private _columns: IColumnSchema[];

  /**
   *
   * @param data 字段键值对，示例如下
   * {
   *  "id": "7b5add42ea6044978630fc74d64592d7",
   *  "number_56eb8e08": 10
   * }
   */
  constructor(data: Record<string, any>[], columns: IColumnSchema[]) {
    this._data = data;
    this._columns = columns;
  }

  async query(dsl: QUERY_CONFIG["dsl_query"]) {
    const sqlGenerator = new DSLTranslator(
      {
        ...dsl,
        from: "?",
      },
      this._columns
    );
    // const sql = parseDsl(dsl, this._columns);
    const sql = sqlGenerator.toSQL();
    console.log(`sql -> ${sql}`);
    const result = await alasql(sql, [this._data]);

    // console.log(`data -> ${JSON.stringify(this._data)}`);
    // console.log(`result -> ${JSON.stringify(result)}`);

    return result;
  }
}
