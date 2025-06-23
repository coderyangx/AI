// 将人员、部门、单多选等对象数据提取出可用于筛选的字段

const formatters = [
  {
    reg: /^people_/i,
    format: (item) => item.name,
  },
  {
    reg: /^department_/i,
    format: (item) => item.label,
  },
  {
    reg: /^select_/i,
    format: (item) => item.label,
  },
  {
    reg: /^selectdd_/i,
    format: (item) => item.map((row) => row.label),
  },
  // TODO more
];

export const formatDataRow = (row) => {
  const keys = Object.keys(row);
  const result: Record<string, any> = {};

  for (const key of keys) {
    const formatter = formatters.find((item) => item.reg.test(key));
    if (formatter) {
      result[key] = formatter.format(row[key]);
    } else {
      result[key] = row[key];
    }
  }

  return result;
};
