#!/bin/bash

echo "🔨 开始构建前端..."
cd packages/client
if [ -d "dist" ]; then
    echo "✅ 发现已存在的前端构建文件，跳过构建"
else
    echo "🔨 开始构建前端..."
    yarn build

    # 检查构建是否成功
    if [ ! -d "dist" ]; then
        echo "❌ 前端构建失败，dist 目录不存在"
        exit 1
    fi
    echo "✅ 前端构建完成！"
fi

# 检查构建是否成功
if [ ! -d "dist" ]; then
    echo "❌ 前端构建失败，dist 目录不存在"
    exit 1
fi

echo "✅ 前端构建完成！"

echo "🚀 启动服务器..."
cd ../server

(sleep 3 && (open http://localhost:8000 2>/dev/null || xdg-open http://localhost:8000 2>/dev/null || start http://localhost:8000 2>/dev/null || echo "请手动访问: http://localhost:8000")) &


echo "🌐 服务器启动中... 访问 http://localhost:8000"
yarn dev
