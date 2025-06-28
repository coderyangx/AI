export const formatters = [
  {
    // 多行文本
    columnType: 1,
  },
  {
    // 数字
    columnType: 2,
  },
  {
    // 单选
    columnType: 3,
    format: (val, config) => {
      if (!val) {
        return null;
      }
      const id = JSON.parse(val)[0];
      if (config) {
        const option = JSON.parse(config).options?.find(
          (item) => item.id === id
        );
        return option?.label ?? null;
      }

      return null;
    },
  },
  {
    columnType: 4, // people
  },
  {
    // 多选
    columnType: 5,
  },
  {
    // 附件
    columnType: 6,
  },
  {
    // 日期
    columnType: 7,
  },
  {
    // 货币
    columnType: 8,
  },
  {
    // 公式
    columnType: 9,
  },
];
