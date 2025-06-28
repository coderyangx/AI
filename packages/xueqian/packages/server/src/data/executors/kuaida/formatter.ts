// 数据清洗，将人员、部门、单多选等对象数据提取出可用于筛选的字段

const formatters = [
  {
    reg: /^(people_|SYSTEM_CREATOR)/i,
    format: (item) => item?.name ?? "",
  },
  {
    reg: /^department_/i,
    format: (item) => item?.label ?? "",
  },
  {
    reg: /^select_/i,
    format: (item) => item?.label ?? "",
  },
  {
    reg: /^(selectdd|associatedrecord)_/i,
    format: (item) => (item || []).filter(Boolean).map((row) => row.label),
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
