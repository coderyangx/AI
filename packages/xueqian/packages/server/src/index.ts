import "dotenv/config";
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { Chat } from "./handlers/chat.js";
import { serveStatic } from "@hono/node-server/serve-static";
import { logger } from "./lib/log/index.js";
import { ChartCitation } from "./handlers/chart-citation.js";
import { S3Preview } from "./handlers/s3.js";
import { fileURLToPath } from "url";
import path from "node:path";
import fs from "fs/promises";
import { SQLPreview } from "./handlers/sql.js";
import { initConfig } from "./config/index.js";
import { ChartOptions } from "./handlers/chart-options.js";
import { Recommendations } from "./handlers/recommendations.js";
import { S3Upload } from "./handlers/upload.js";
import { createNodeWebSocket } from "@hono/node-ws";
import { DeepAnalysisChat } from "./handlers/ws/deep-analysis-chat.js";

const app = new Hono();

const { injectWebSocket, upgradeWebSocket } = createNodeWebSocket({ app });

app.use(
  "/ai-agent/static/*",
  serveStatic({
    root: "../widgets/dist",
    rewriteRequestPath(path) {
      return path.replace("/ai-agent/static/", "/");
    },
  })
);

app.get("/", (c) => {
  return c.text("Hello World!");
});

app.get("/ai-agent", (c) => {
  logger.info("ok");
  return c.text("Hello World!");
});

app.get("/monitor/alive", (c) => {
  return c.text("OCTO check ok");
});

app.post("/ai-agent/chat", Chat);
app.post("/ai-agent/chart-citation", ChartCitation);
app.post("/ai-agent/chart-options", ChartOptions);
app.get("/ai-agent/object/:key", S3Preview);
app.post("/ai-agent/attachments/upload", S3Upload);
app.post("/ai-agent/query/preview", SQLPreview);
app.post("/ai-agent/recommendations", Recommendations);

app.get("/ai-agent/chat/app", async (c) => {
  const view = await c.req.query("view");
  const env = await c.req.query("env");

  if (process.env.NODE_ENV === "local") {
    const targetUrl = `http://localhost:5173?view=${view}&env=${env}`;
    const proxyResponse = await fetch(targetUrl);
    let htmlContent = await proxyResponse.text();
    htmlContent = htmlContent.replace(
      "<head>",
      `<head>\n<base href="http://localhost:5173">`
    );

    return c.html(htmlContent, 200);
  }

  const __filename = fileURLToPath(import.meta.url);
  const file = path.join(
    path.dirname(__filename),
    "../../widgets/dist/.vite/manifest.json"
  );
  const content = await fs.readFile(file, "utf8");
  const json = JSON.parse(content);
  const jsFile = json["src/entries/datasheet-chat/index.tsx"].file;

  return c.html(`<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title></title>
  <script>
      "use strict";
      !(function (u, d) {
        var t = "owl",
          e = "_Owl_",
          n = "Owl",
          r = "start",
          c = "error",
          p = "on" + c,
          f = u[p],
          h = "addEventListener",
          l = "attachEvent",
          v = "isReady",
          b = "dataSet";
        (u[t] =
          u[t] ||
          function () {
            try {
              u[t].q = u[t].q || [];
              var e = [].slice.call(arguments);
              e[0] === r
                ? u[n] && u[n][r]
                  ? u[n][r](e[1])
                  : u[t].q.unshift(e)
                : u[t].q.push(e);
            } catch (e) {}
          }),
          (u[e] = u[e] || {
            preTasks: [],
            pageData: [],
            use: function (e, t) {
              this[v] ? u[n][e](t) : this.preTasks.push({ api: e, data: [t] });
            },
            run: function (t) {
              if (!(t = this).runned) {
                (t.runned = !0),
                  (t[b] = []),
                  (u[p] = function () {
                    t[v] || t[b].push({ type: "jsError", data: arguments }),
                      f && f.apply(u, arguments);
                  }),
                  u[h] &&
                    u[h]("unhandledrejection", function (e) {
                      t[v] || t[b].push({ type: "jsError", data: [e] });
                    });
                var e = function (e) {
                  !t[v] && e && t[b].push({ type: "resError", data: [e] });
                };
                u[h] ? u[h](c, e, !0) : u[l] && u[l](p, e);
                var n = "MutationObserver",
                  r = u[n] || u["WebKit" + n] || u["Moz" + n],
                  a = u.performance || u.WebKitPerformance,
                  s = "disableMutaObserver";
                if (r && a && a.now)
                  try {
                    var i = -1,
                      o = u.navigator.userAgent;
                    -1 < o.indexOf("compatible") && -1 < o.indexOf("MSIE")
                      ? (new RegExp("MSIE (\\d+\\.\\d+);").test(o),
                        (i = parseFloat(RegExp.$1)))
                      : -1 < o.indexOf("Trident") &&
                        -1 < o.indexOf("rv:11.0") &&
                        (i = 11),
                      -1 !== i && i <= 11
                        ? (t[s] = !0)
                        : (t.observer = new r(function (e) {
                            t.pageData.push({
                              mutations: e,
                              startTime: a.now(),
                            });
                          })).observe(d, { childList: !0, subtree: !0 });
                  } catch (e) {}
                else t[s] = !0;
              }
            },
          }),
          u[e].runned || u[e].run();
      })(window, document);
    </script>
    <script
      crossorigin="anonymous"
      src="//www.dpfile.com/app/owl/static/owl_1.10.0.js"
    ></script>
    <script>
      window.owl("start", {
        project: "com.sankuai.oa.unicard.sdk",
        devMode: ${process.env.NODE_ENV !== "production"},
      });
    </script>
</head>
<body>
  <div id="root"></div>
  <script src="/ai-agent/static/${jsFile}">
  </script>
  <script type='text/javascript'>
    window.DatasheetChat && window.DatasheetChat.init(document.getElementById('root'), ${JSON.stringify(
      { view, env }
    )});
  </script>
</body>
</html>`);
});

app.get("/ai-agent/ws/chat", upgradeWebSocket(DeepAnalysisChat));

const server = serve(
  {
    fetch: app.fetch,
    port: process.env.NODE_PORT ? Number(process.env.NODE_PORT) : 8080,
  },
  (info) => {
    initConfig();
    console.log(`Server is running on http://localhost:${info.port}`);
  }
);

injectWebSocket(server);
