import { IColumnSchema } from "../../data/types";
import { QUERY_CONFIG } from "./dsl-schema";

export class DSLTranslator {
  private query: QUERY_CONFIG["dsl_query"];

  private columns: IColumnSchema[];

  constructor(query: QUERY_CONFIG["dsl_query"], columns: IColumnSchema[] = []) {
    this.query = query;
    this.columns = columns;
  }

  toSQL(): string {
    const select = this.buildSelect();
    const from = `FROM ${this.escapeId(this.query.from)}`;
    const where = this.buildWhere();
    const groupBy = this.buildGroupBy();
    const orderBy = this.buildOrderBy();
    const limit = this.buildLimit();

    return [select, from, where, groupBy, orderBy, limit]
      .filter(Boolean)
      .join(" ")
      .trim();
  }

  private buildSelect(): string {
    const fields = this.query.select.map((f) => {
      if ("aggr" in f) {
        let aggr =
          f.aggr === "COUNT_DISTINCT" ? "COUNT(DISTINCT " : f.aggr + "(";
        let close = f.aggr === "COUNT_DISTINCT" ? ")" : ")";
        const col = this.escapeId(f.column);
        let expr = `${aggr}${col}${close}`;
        if (f.alias) {
          expr += ` AS ${this.escapeId(f.alias)}`;
        }
        return expr;
      } else {
        let expr = this.escapeId(f.column);
        if (f.alias) {
          expr += ` AS ${this.escapeId(f.alias)}`;
        }
        return expr;
      }
    });
    return `SELECT ${fields.join(", ")}`;
  }

  private buildWhere(): string {
    if (!this.query.where || this.query.where.length === 0) return "";
    const clauses = this.query.where.map((cond) => {
      const col = this.escapeId(cond.column);
      const value = this.normalizeConditionValue(cond.value, cond.column);

      switch (cond.operator.toLowerCase()) {
        case "eq":
          return `${col} = ${this.escapeValue(value)}`;
        case "ne":
          return `${col} <> ${this.escapeValue(value)}`;
        case "gt":
          return `${col} > ${this.escapeValue(value)}`;
        case "lt":
          return `${col} < ${this.escapeValue(value)}`;
        case "gte":
          return `${col} >= ${this.escapeValue(value)}`;
        case "lte":
          return `${col} <= ${this.escapeValue(value)}`;
        case "in":
          if (Array.isArray(value)) {
            return `${col} IN (${value.map(this.escapeValue).join(", ")})`;
          }
          throw new Error("IN operator value must be array");
        case "like":
          return `${col} LIKE ${this.escapeValue(value)}`;
        default:
          throw new Error("Unsupported operator");
      }
    });
    return `WHERE ${clauses.join(" AND ")}`;
  }

  private buildGroupBy(): string {
    if (!this.query.groupBy || this.query.groupBy.length === 0) return "";
    const groupFields = this.query.groupBy.map(this.escapeId);
    return `GROUP BY ${groupFields.join(", ")}`;
  }

  private buildOrderBy(): string {
    if (!this.query.orderBy || this.query.orderBy.length === 0) return "";
    const orderFields = this.query.orderBy.map(
      (o) => `${this.escapeId(o.column)} ${o.direction}`
    );
    return `ORDER BY ${orderFields.join(", ")}`;
  }

  private buildLimit(): string {
    if (!this.query.limit) return "";
    return `LIMIT ${this.query.limit}`;
  }

  // 简单的防注入转义
  private escapeId(id: string): string {
    if (["*", "?"].includes(id)) {
      return id;
    }
    // DATE_FORMAT(col, 'yyyy')
    if (/^[a-z0-9_]+\(/i.test(id)) {
      return id.replace(/^([a-z0-9_]+\()([^,]+)(.+\))/i, "$1`$2`$3");
    }
    return `\`${id.replace(/`/g, "``")}\``;
  }

  private escapeValue(val: string | number | string[]): string {
    if (typeof val === "number") return val.toString();
    // 简单字符串转义
    const replace = (v) => `'${v.replace(/'/g, "''")}'`;
    return replace(val);
  }

  private normalizeConditionValue<T = any>(value: T, field: string): any {
    if (!value) {
      return value;
    }

    const column = field
      ? this.columns.find((item) => item.name === field)
      : null;

    if (!column) {
      return value;
    }

    // 日期字符串的比较处理
    if (column.type === "TIMESTAMP" && typeof value === "string") {
      console.log("value", column, new Date(value as string));
      return (new Date(value as string).getTime() - 1000 * 3600 * 8) as T;
    }

    return value;
  }
}
