# Cloudflare Pages 部署指南

本指南介绍如何将 API 服务部署到 Cloudflare Pages，使用 Cloudflare Pages Functions。

## 目录结构

```
packages/server/
├── functions/               # Cloudflare Pages Functions 代码
│   ├── _middleware.ts       # 中间件，处理CORS等通用功能
│   ├── index.ts             # 根路径处理
│   └── api/                 # API端点
│       └── agent/           # 代理相关API
│           ├── chat.ts      # 聊天API
│           ├── stream.ts    # 流式聊天API
│           └── test.ts      # 测试API
├── cloudflare.toml          # Cloudflare配置
└── package.json             # 项目依赖
```

## 部署步骤

### 1. 准备工作

确保已安装 Wrangler CLI：

```bash
npm install -g wrangler
```

### 2. 登录 Cloudflare

```bash
wrangler login
```

### 3. 部署

有两种方式部署：

#### 方式 1：直接部署

```bash
cd packages/server
wrangler pages publish . --project-name=ai-agent-api
```

#### 方式 2：通过 Cloudflare Dashboard

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 进入 Pages 服务
3. 创建新应用，并连接您的 Git 仓库
4. 设置构建配置:
   - 构建命令：`cd packages/server && yarn install && yarn build`
   - 输出目录：`packages/server/dist`
5. 环境变量:
   - 添加 `FRIDAY_API_KEY` 环境变量（值为 API 密钥）

## 本地测试

可以使用 Wrangler 在本地测试 Pages Functions：

```bash
cd packages/server
wrangler pages dev .
```

## 注意事项

1. API 密钥直接硬编码在代码中，仅用于开发和测试。在生产环境中应使用 Cloudflare 环境变量。

2. Cloudflare Pages Functions 与 Express 有一些区别，主要是：

   - 不支持 Express 中间件
   - 请求和响应对象使用 Web 标准的 `Request` 和 `Response`
   - 路由基于文件系统，而非代码定义

3. 流式响应在 Cloudflare Workers 环境中完全支持，通过 ReadableStream 实现。
