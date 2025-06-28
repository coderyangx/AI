import { DSLTranslator } from "../src/lib/query/dsl-to-sql.js";
import alasql from "alasql";
import { format } from "date-fns";

const dsl1 = {
  from: "dataSheet1",
  select: [
    {
      column: "select_0b0d0d15",
      alias: "region",
    },
    {
      column: "people_786bfb54",
      alias: "employee_count",
      aggr: "COUNT_DISTINCT",
    },
  ],
  where: [],
  group_by: ["select_0b0d0d15"],
  order_by: [],
  limit: null,
};

const converter1 = new DSLTranslator(dsl1 as any, []);
console.log(converter1.toSQL());

const dsl2 = {
  from: "dataSheet1",
  select: [
    {
      column: "select_73eb63f2",
      alias: "count_active",
      aggr: "COUNT",
    },
    {
      column: "*",
      alias: "total_count",
      aggr: "COUNT",
    },
  ],
  where: [],
  group_by: ["select_73eb63f2"],
  order_by: [],
  limit: null,
};

const converter2 = new DSLTranslator(dsl2 as any, []);
console.log(converter2.toSQL());

const dsl3 = {
  from: "view-mkr05m6a2rp90sn146pp7",
  select: [
    {
      column: "SYSTEM_CREATOR",
      alias: "available_employee_count",
      function: "COUNT_DISTINCT",
    },
  ],
  where: [
    {
      column: "select_286af6de",
      operator: "eq",
      value: "有空的~我想去",
    },
  ],
  group_by: [],
  order_by: [],
  limit: null,
};

const converter3 = new DSLTranslator(dsl3 as any, []);
console.log(converter3.toSQL());

const data = [
  {
    date: new Date().getTime(),
  },
];

alasql.fn["DATE_FORMAT"] = (ts: number, fm: string) => {
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

const result = alasql(
  // "SELECT DATE_FORMAT(date, 'yyyy-MM') AS `resignation_month` FROM ?",
  "SELECT DATE_FORMAT(date, '%Y-%m') AS `resignation_month` FROM ?",
  [data]
);

console.log("result", result);
