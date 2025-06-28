import { IQueryExecutorFunction } from "../types";

class ExecutorRegistryManager {
  private executors: Map<string, IQueryExecutorFunction> = new Map();

  public registerExecutor(
    name: string,
    executor: IQueryExecutorFunction
  ): void {
    if (this.executors.has(name)) {
      throw new Error(`数据查询执行器<${name}>已存在`);
    }
    this.executors.set(name, executor);
  }

  public getExecutor(name: string): IQueryExecutorFunction {
    return this.executors.get(name);
  }

  // register data filters
}

export const executorRegistryManager = new ExecutorRegistryManager();
