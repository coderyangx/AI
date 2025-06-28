import { QueryDesignAgent } from "../src/agents/query-design.js";

const view = "view-zgratr8lcyh9uvy0dodcs";

const tableInfo = {
  table_name: view,
  columns: [
    {
      name: "select_3305b101",
      type: "VARCHAR",
      description: "在职/离职状态",
    },
    {
      name: "date_9f2e0d66",
      type: "TIMESTAMP",
      description: "辞职时间",
    },
    {
      name: "select_055b2208",
      type: "VARCHAR",
      description: "辞职原因",
    },
    {
      name: "people_fc482687",
      type: "VARCHAR",
      description: "人员姓名",
    },
  ],
};

const task = {
  task_id: "HGk8vb",
  goal: "统计各月离职人数及离职原因，用于离职原因趋势分析。",
  table: view,
  condition: "select_3305b101 = '离职'",
  output: [
    "DATE_FORMAT(date_9f2e0d66, '%Y-%m') AS resignation_month",
    "select_055b2208 AS resignation_reason",
    "COUNT(people_fc482687) AS resignation_count",
  ],
};

// const agent = new QueryDesignAgent({
//   env: "local",
//   view,
//   cookie: "",
//   tableInfo,
// });

// agent
//   .run({
//     input: JSON.stringify(task),
//   })
//   .then((r) => {
//     console.log(JSON.stringify(r, null, 2));
//   })
//   .catch(console.error);
