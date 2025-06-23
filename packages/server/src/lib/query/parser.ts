import {
  JsonFilterCondition,
  JsonSelectField,
  JsonSimpleFilter,
  QueryDsl,
  QueryDslSchema,
} from "./dsl";

export class SQLGenerator {
  private dsl: QueryDsl;
  private columns: { column_name: string; data_type: string }[];

  constructor(
    dsl: QueryDsl,
    columns: { column_name: string; data_type: string }[]
  ) {
    // 运行时验证输入的 DSL 是否符合 schema
    const validationResult = QueryDslSchema.safeParse(dsl);
    if (!validationResult.success) {
      // 可以在此处抛出更详细的错误信息
      throw new Error(
        `Invalid query dsl provided: ${validationResult.error.errors
          .map((err) => err.message)
          .join(", ")}`
      );
    }
    this.dsl = validationResult.data;
    this.columns = columns;
  }

  /**
   * 内部方法：将值转换为 SQL 安全的字符串（加引号和转义）。
   */
  private escapeValue(value: any): string {
    if (value === null) {
      return "NULL";
    }
    if (typeof value === "string") {
      // 简单的单引号转义
      return `'${value.replace(/'/g, "''")}'`;
    }
    if (typeof value === "boolean") {
      return value ? "TRUE" : "FALSE";
    }
    if (Array.isArray(value)) {
      return `(${value.map((v) => this.escapeValue(v)).join(", ")})`;
    }
    return String(value); // 数字直接返回
  }

  /**
   * 内部方法：引用字段名或表名，防止与 SQL 关键字冲突。
   */
  private quoteIdentifier(identifier: string): string {
    return `\`${identifier}\``;
  }

  /**
   * 内部方法：构建 SELECT 子句。
   */
  private buildSelectClause(): string {
    const selectParts: string[] = [];

    // 优先处理聚合函数
    if (this.dsl.aggregations && this.dsl.aggregations.length > 0) {
      this.dsl.aggregations.forEach((agg) => {
        const funcName = agg.type.toUpperCase();
        const field = agg.field === "*" ? "*" : this.quoteIdentifier(agg.field);
        const alias = agg.alias ? ` AS ${this.quoteIdentifier(agg.alias)}` : "";
        selectParts.push(`${funcName}(${field})${alias}`);
      });
    }

    // 处理普通字段
    if (this.dsl.select && this.dsl.select.length > 0) {
      this.dsl.select.forEach((field: JsonSelectField) => {
        if (typeof field === "string") {
          selectParts.push(this.quoteIdentifier(field));
        } else {
          const originalField = Object.keys(field)[0];
          const alias = field[originalField];
          selectParts.push(
            `${this.quoteIdentifier(originalField)} AS ${this.quoteIdentifier(
              alias
            )}`
          );
        }
      });
    }

    // 如果没有指定任何字段或聚合函数，则默认选择所有字段
    if (selectParts.length === 0) {
      selectParts.push("*");
    }

    const distinct = this.dsl.distinct ? "DISTINCT " : "";
    return `SELECT ${distinct}${selectParts.join(", ")}`;
  }

  private normalizeConditionValue<T = any>(value: T, field: string): T {
    if (!value) {
      return;
    }

    const column = field
      ? this.columns.find((item) => item.column_name === field)
      : null;

    if (!column) {
      return value;
    }

    if (column.data_type === "TIMESTAMP" && typeof value === "string") {
      return (new Date(value as string).getTime() - 1000 * 3600 * 8) as T;
    }

    return value;
  }

  /**
   * 内部方法：递归构建 WHERE 子句的单个条件。
   */
  private buildWhereCondition(condition: JsonFilterCondition): string {
    if ("AND" in condition && condition.AND) {
      // 复合 AND 条件
      const parts = condition.AND.map(
        (c) => `(${this.buildWhereCondition(c)})`
      );
      return parts.join(" AND ");
    } else if ("OR" in condition && condition.OR) {
      // 复合 OR 条件
      const parts = condition.OR.map((c) => `(${this.buildWhereCondition(c)})`);
      return parts.join(" OR ");
    } else if ("NOT" in condition && condition.NOT) {
      // 复合 NOT 条件
      return `NOT (${this.buildWhereCondition(condition.NOT)})`;
    } else {
      // 简单过滤条件
      const simpleFilter = condition as JsonSimpleFilter;
      const field = this.quoteIdentifier(simpleFilter.field);
      const operator = simpleFilter.operator || "="; // 默认操作符为 '='
      const value = simpleFilter.value;

      switch (operator.toUpperCase()) {
        case "IS NULL":
        case "IS NOT NULL":
          // IS NULL / IS NOT NULL 不使用 value
          return `${field} ${operator}`;
        case "IN":
        case "NOT IN":
          if (!Array.isArray(value)) {
            throw new Error(
              `Invalid value for '${operator}' operator: must be an array for field '${simpleFilter.field}'.`
            );
          }
          return `${field} ${operator} ${this.escapeValue(
            this.normalizeConditionValue(value, simpleFilter.field)
          )}`;
        default:
          return `${field} ${operator} ${this.escapeValue(
            this.normalizeConditionValue(value, simpleFilter.field)
          )}`;
      }
    }
  }

  /**
   * 内部方法：构建 WHERE 子句。
   */
  private buildWhereClause(): string {
    if (!this.dsl.where) {
      return "";
    }
    const whereCondition = this.buildWhereCondition(this.dsl.where);
    return whereCondition ? ` WHERE ${whereCondition}` : "";
  }

  /**
   * 内部方法：构建 GROUP BY 子句。
   */
  private buildGroupByClause(): string {
    if (!this.dsl.groupBy || this.dsl.groupBy.length === 0) {
      return "";
    }
    return ` GROUP BY ${this.dsl.groupBy
      .map((field) => this.quoteIdentifier(field))
      .join(", ")}`;
  }

  /**
   * 生成最终的 SQL 查询字符串。
   * @returns 生成的 SQL 字符串。
   */
  public generate(): string {
    let sql = this.buildSelectClause();
    sql += ` FROM ?`;
    sql += this.buildWhereClause();
    sql += this.buildGroupByClause();
    return sql + ";";
  }
}

export const parseDsl = (
  dsl: QueryDsl,
  columns: { column_name: string; data_type: string }[]
) => {
  const generator = new SQLGenerator(dsl, columns);
  return generator.generate();
};
