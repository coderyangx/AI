import { z } from "zod";

// {
//     "task_id": 1,
//     "goal": "获取2023年每月新注册用户列表",
//     "table": "users",
//     "condition": "register_date BETWEEN '2023-01-01' AND '2023-12-31'",
//     "output": "user_id, register_date"
//   },
export const QueryTaskSchema = z.object({
  task_id: z.string().describe("任务唯一 ID"),
  goal: z.string().describe("任务的目标介绍"),
  table: z.string().describe("查询的数据表"),
  condition: z.string().describe("查询筛选条件的伪代码表示").optional(),
  dependencies: z.string().describe("依赖任务列表").optional(),
  output: z.array(z.string()).describe("任务输出的数据字段"),
});

export type IQueryTask = z.infer<typeof QueryTaskSchema>;
