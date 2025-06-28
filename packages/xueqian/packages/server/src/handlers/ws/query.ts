import { WSContext } from "hono/ws";
import { IRunContext } from "../../types/context";
import { sessionMemoryManager } from "../../lib/cache/session.js";
import { AgentTaskManager } from "../../agents/v2/task/manager.js";

export async function executeQuery(
  runContext: IRunContext,
  ws: WSContext<unknown>
) {
  console.log("executeQuery");
  runContext.memory = sessionMemoryManager.get(runContext.sessionId);
  try {
    await new Promise(async (resolve, reject) => {
      const taskManager = new AgentTaskManager(runContext);
      taskManager.start();

      taskManager.on("message", (msg) => {
        ws.send(msg);
      });

      taskManager.on("finish", () => {
        resolve(true);
      });

      taskManager.on("error", (err) => {
        reject(err);
      });
    });
    console.log("end");
  } catch (e) {
    console.log("eee", e);
    // TODO
  }
}
